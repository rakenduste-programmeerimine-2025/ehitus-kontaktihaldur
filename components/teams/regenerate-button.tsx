"use client"

import { useTransition } from "react"
import { regenerate } from "@/app/teams/regenerate"

export function RegenerateButton({ teamId }: { teamId: number }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => regenerate(teamId))}
      disabled={isPending}
      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {isPending ? "Updating..." : "Regenerate Invite Code"}
    </button>
  )
}
