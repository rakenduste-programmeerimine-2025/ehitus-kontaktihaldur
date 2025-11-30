"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { leaveTeam } from "@/app/teams/actions"

export function LeaveTeamButton({
  teamId,
  isAdmin,
  isSoloAdmin,
  isOnlyMember,
}: {
  teamId: number
  isAdmin: boolean
  isSoloAdmin: boolean
  isOnlyMember: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const disabled = isAdmin && isSoloAdmin && !isOnlyMember

  const handleLeave = () => {
    startTransition(async () => {
      const res = await leaveTeam(teamId)
      if (res.success) {
        router.push("/teams")
      } else {
        alert(res.message)
      }
    })
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(true)}
        disabled={disabled || isPending}
        className={`px-4 py-2 rounded text-white ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        } disabled:opacity-50`}
      >
        {isPending ? "Leaving..." : "Leave Team"}
      </button>

      {disabled && (
        <p className="text-sm text-neutral-500 mt-2">
          You are the only admin. Assign another admin before leaving.
        </p>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
            <h2 className="text-lg font-semibold">Leave Team?</h2>
            <p className="text-neutral-700 mt-2">
              Are you sure you want to leave this team?
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-3 py-1 rounded bg-neutral-200 hover:bg-neutral-300"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>

              {!disabled && (
                <button
                  className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                  onClick={handleLeave}
                >
                  Yes, Leave
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
