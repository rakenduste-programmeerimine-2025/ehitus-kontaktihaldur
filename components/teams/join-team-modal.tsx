"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { joinTeamAction } from "@/app/teams/actions"
import { toast } from "sonner"

export default function JoinTeamModal() {
  const [open, setOpen] = useState(false)

  const [state, action] = useActionState(joinTeamAction, {
    success: false,
    message: "",
  })

  useEffect(() => {
    const handler = () => {
      setOpen(true)
    }
    window.addEventListener("open-join-team-modal", handler)
    return () => window.removeEventListener("open-join-team-modal", handler)
  }, [])

  useEffect(() => {
    if (!state.message) return

    if (state.success) toast.success(state.message)
    else toast.error(state.message)
  }, [state])

  useEffect(() => {
    if (state.success) {
      setOpen(false)
    }
  }, [state.success])

  const close = () => {
    setOpen(false)
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />

      <div className="fixed inset-0 flex items-center justify-center z-50">
        <form
          action={action}
          className="bg-white p-6 rounded-lg w-80 space-y-4 shadow-lg"
        >
          <h2 className="text-lg font-semibold">Join a Team</h2>

          <input
            required
            name="code"
            placeholder="Enter invite code"
            className="w-full border rounded p-2 uppercase"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="px-3 py-1 rounded bg-neutral-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-3 py-1 rounded bg-blue-600 text-white"
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
