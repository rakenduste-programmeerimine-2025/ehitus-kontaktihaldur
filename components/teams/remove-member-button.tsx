"use client"

import { useState, useTransition } from "react"
import { removeMember } from "@/app/teams/actions"
import { Trash } from "lucide-react"

export function RemoveMemberButton({
  memberId,
  teamId,
  disabled,
  isAdminTarget,
  onSuccess,
}: {
  memberId: number
  teamId: number
  disabled: boolean
  isAdminTarget: boolean
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  return (
    <>
      <button
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        title={disabled ? "Admins cannot be removed" : "Remove member"}
        className={`p-2 rounded hover:bg-red-100 ${
          disabled ? "opacity-40 cursor-not-allowed" : "text-red-600"
        }`}
      >
        <Trash className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-xl font-semibold mb-4 text-left">
              Remove Member
            </h2>

            {isAdminTarget ? (
              <p className="text-red-600 text-sm mb-4">
                This member is an admin and cannot be removed.
              </p>
            ) : (
              <p className="text-neutral-700 leading-relaxed mb-5 text-left">
                Are you sure you want to remove this member?
              </p>
            )}

            {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1 rounded border bg-neutral-50 hover:bg-neutral-100"
              >
                Cancel
              </button>

              {!isAdminTarget && (
                <button
                  onClick={() =>
                    startTransition(async () => {
                      const res = await removeMember(memberId, teamId)

                      if (!res.success) {
                        setError(res.message ?? "Failed to remove member.")
                        return
                      }

                      onSuccess()
                      setOpen(false)
                    })
                  }
                  disabled={isPending}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  {isPending ? "Removing…" : "Remove"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
