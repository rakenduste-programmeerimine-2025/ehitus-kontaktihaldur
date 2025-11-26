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

export async function createTeamAction(
  _prevState: unknown,
  formData: FormData,
) {
  const name = formData.get("name")?.toString().trim()
  if (!name) {
    return {
      success: false,
      message: "Team name is required.",
      joinCode: "",
    }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      message: "Not authenticated.",
      joinCode: "",
    }
  }
  const inviteCode = generateInviteCode()

  const { data: team, error: teamError } = await supabase
    .from("team")
    .insert({
      name,
      invite_code: inviteCode,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (teamError) {
    return {
      success: false,
      message: teamError.message,
      joinCode: "",
    }
  }

  const { error: memberError } = await supabase
    .from("team_member")
    .insert({
      team_id: team.id,
      user_id: user.id,
      role_id: 1,   // ADMIN
      status_id: 2, // APPROVED
    })

  if (memberError) {
    return {
      success: false,
      message: memberError.message,
      joinCode: "",
    }
  }

  revalidatePath("/teams")

  return {
    success: true,
    message: `Team "${name}" created successfully!`,
    joinCode: inviteCode,
  }
}
export async function joinTeamAction(
  _prevState: unknown,
  formData: FormData,
) {
  const code = formData.get("code")?.toString().trim().toLowerCase()

  if (!code) {
    return {
      success: false,
      message: "Invite code is required.",
    }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      message: "Not authenticated.",
    }
  }

  const { data: team } = await supabase
    .from("team")
    .select("id, invite_code")
    .eq("invite_code", code)
    .maybeSingle()

  if (!team) {
    return {
      success: false,
      message: "Team not found. Check the invite code.",
    }
  }

  const { data: existing } = await supabase
    .from("team_member")
    .select("id, status_id")
    .eq("team_id", team.id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) {
    if (existing.status_id === 2) {
      return {
        success: false,
        message: "You are already a member of this team.",
      }
    }
    if (existing.status_id === 1) {
      return {
        success: false,
        message: "Your join request is still pending approval.",
      }
    }
    if (existing.status_id === 3) {
      return {
        success: false,
        message: "Your join request was rejected.",
      }
    }
  }

  const { error: joinError } = await supabase
    .from("team_member")
    .insert({
      team_id: team.id,
      user_id: user.id,
      role_id: 3,    // VIEWER
      status_id: 1,  // PENDING
    })

  if (joinError) {
    return {
      success: false,
      message: joinError.message,
    }
  }

  return {
    success: true,
    message: "Join request sent! Waiting for team admin approval.",
  }
}
