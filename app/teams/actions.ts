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
  const { error: memberError } = await supabase.from("team_member").insert({
    team_id: team.id,
    user_id: user.id,
    role_id: 1,
    status_id: 2,
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
