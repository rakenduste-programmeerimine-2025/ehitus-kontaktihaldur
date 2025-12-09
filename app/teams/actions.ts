"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

function generateInviteCode(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let code = ""
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function createTeamAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get("name")?.toString().trim()
  if (!name) {
    return { success: false, message: "Team name is required.", joinCode: "" }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Not authenticated.", joinCode: "" }
  }

  const inviteCode = generateInviteCode()

  const { data: team, error: teamError } = await supabase
    .from("team")
    .insert({
      name,
      invite_code: inviteCode,
      created_by: user.id,
    })
    .select()
    .single()

  if (teamError) {
    return { success: false, message: teamError.message, joinCode: "" }
  }

  const { error: memberError } = await supabase.from("team_member").insert({
    team_id: team.id,
    user_id: user.id,
    role_id: 1, // ADMIN
    status_id: 2, // APPROVED
  })

  if (memberError) {
    return { success: false, message: memberError.message, joinCode: "" }
  }

  revalidatePath("/teams")

  return {
    success: true,
    message: `Team "${name}" created successfully!`,
    joinCode: inviteCode,
  }
}
export async function joinTeamAction(_prev: unknown, formData: FormData) {
  const supabase = await createClient()

  const code = formData.get("code")?.toString().trim().toLowerCase()
  if (!code) {
    return { success: false, message: "Invite code is required." }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Not authenticated." }
  }

  const { data: team } = await supabase
    .from("team")
    .select("id, invite_code")
    .eq("invite_code", code)
    .maybeSingle()

  if (!team) {
    return { success: false, message: "Team not found. Check the invite code." }
  }

  const { data: existing } = await supabase
    .from("team_member")
    .select("id, status_id")
    .eq("team_id", team.id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) {
    if (existing.status_id === 2)
      return { success: false, message: "You are already a member." }
    if (existing.status_id === 1)
      return { success: false, message: "Join request pending approval." }
    if (existing.status_id === 3)
      return { success: false, message: "Your request was rejected." }
  }

  const { error: joinError } = await supabase.from("team_member").insert({
    team_id: team.id,
    user_id: user.id,
    role_id: 2, // VIEWER
    status_id: 1, // PENDING
  })

  if (joinError) {
    return { success: false, message: joinError.message }
  }

  return { success: true, message: "Join request sent! Awaiting approval." }
}

export async function approveMember(memberId: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Not authenticated." }

  const { data: target, error: targetErr } = await supabase
    .from("team_member")
    .select("team_id")
    .eq("id", memberId)
    .single()

  if (!target || targetErr) {
    return { success: false, message: "Member not found." }
  }

  const { data: adminMember } = await supabase
    .from("team_member")
    .select("role_id")
    .eq("team_id", target.team_id)
    .eq("user_id", user.id)
    .single()

  if (!adminMember || adminMember.role_id !== 1) {
    return { success: false, message: "Not authorized." }
  }

  await supabase.from("team_member").update({ status_id: 2 }).eq("id", memberId)

  revalidatePath(`/teams/${target.team_id}`)

  return { success: true }
}

export async function rejectMember(memberId: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, message: "Not authenticated." }

  const { data: target } = await supabase
    .from("team_member")
    .select("team_id")
    .eq("id", memberId)
    .single()

  if (!target) {
    return { success: false, message: "Member not found." }
  }

  const { data: adminMember } = await supabase
    .from("team_member")
    .select("role_id")
    .eq("team_id", target.team_id)
    .eq("user_id", user.id)
    .single()

  if (!adminMember || adminMember.role_id !== 1) {
    return { success: false, message: "Not authorized." }
  }

  await supabase.from("team_member").update({ status_id: 3 }).eq("id", memberId)

  revalidatePath(`/teams/${target.team_id}`)

  return { success: true }
}

export async function removeMember(memberId: number, teamId: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, message: "Not authenticated." }

  const { data: target } = await supabase
    .from("team_member")
    .select("user_id, role_id")
    .eq("id", memberId)
    .single()

  if (!target) {
    return { success: false, message: "Member not found." }
  }

  const { data: acting } = await supabase
    .from("team_member")
    .select("role_id, user_id")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single()

  if (!acting || acting.role_id !== 1) {
    return { success: false, message: "Only admins can remove members." }
  }

  if (target.role_id === 1) {
    return { success: false, message: "Admins cannot be removed." }
  }

  await supabase.from("team_member").delete().eq("id", memberId)

  revalidatePath(`/teams/${teamId}`)
  return { success: true }
}

export async function changeRole(memberId: number, role: string) {
  const supabase = await createClient()

  const roleId = role === "ADMIN" ? 1 : role === "EDITOR" ? 2 : 3

  await supabase
    .from("team_member")
    .update({ role_id: roleId })
    .eq("id", memberId)

  revalidatePath("/teams")
}

export async function regenerateInviteCode(teamId: number) {
  const supabase = await createClient()
  const newCode = generateInviteCode()

  await supabase.from("team").update({ invite_code: newCode }).eq("id", teamId)

  revalidatePath(`/teams/${teamId}`, "page")
}

export async function renameTeam(teamId: number, newName: string) {
  const supabase = await createClient()

  await supabase.from("team").update({ name: newName }).eq("id", teamId)

  revalidatePath(`/teams/${teamId}`)
}

export async function leaveTeam(teamId: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, message: "Not authenticated." }

  const { data: selfMember } = await supabase
    .from("team_member")
    .select("*")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .single()

  if (!selfMember) {
    return { success: false, message: "You are not a member of this team." }
  }

  const { data: allMembers } = await supabase
    .from("team_member")
    .select("id, role_id, user_id")
    .eq("team_id", teamId)

  if (!allMembers) {
    return { success: false, message: "Could not fetch team members." }
  }

  const memberCount = allMembers.length
  const adminCount = allMembers.filter(m => m.role_id === 1).length

  if (memberCount === 1) {
    await supabase.from("team_member").delete().eq("id", selfMember.id)
    await supabase.from("team").delete().eq("id", teamId)

    revalidatePath("/teams")
    return { success: true, deletedTeam: true }
  }

  if (selfMember.role_id === 1 && adminCount === 1) {
    return {
      success: false,
      message: "You are the only admin. Assign another admin before leaving.",
    }
  }

  await supabase.from("team_member").delete().eq("id", selfMember.id)

  revalidatePath("/teams")
  return { success: true }
}
