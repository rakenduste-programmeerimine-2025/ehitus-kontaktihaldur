"use server"

import { regenerateInviteCode } from "@/app/teams/actions"

export async function regenerate(teamId: number) {
  await regenerateInviteCode(teamId)
}
