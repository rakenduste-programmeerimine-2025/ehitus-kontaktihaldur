"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { createTeamAction } from "@/app/teams/actions"
import { toast } from "sonner"

type TeamState = {
  success: boolean
  message: string
  joinCode: string
}

const initialActionState: TeamState = {
  success: false,
  message: "",
  joinCode: "",
}

export default function CreateTeamModal() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [created, setCreated] = useState(false)

  const [state, action] = useActionState<TeamState, FormData>(
    createTeamAction,
    initialActionState,
  )

  useEffect(() => {
    const handler = () => {
      setOpen(true)
      setCreated(false)
      setCopied(false)
    }

    window.addEventListener("open-create-team-modal", handler)
    return () => window.removeEventListener("open-create-team-modal", handler)
  }, [])

  useEffect(() => {
    if (!state.message.trim()) return

    if (state.success) {
      toast.success(state.message)
      setCreated(true)
    } else {
      toast.error(state.message)
    }
  }, [state])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(state.joinCode)
      toast.success("Copied!")
      setCopied(true)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const close = () => {
    setOpen(false)
    setCreated(false)
    setCopied(false)
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />

      <div className="fixed inset-0 flex items-center justify-center z-50">
        {!created ? (
          <form
            action={action}
            className="bg-white p-6 rounded-lg w-80 space-y-4 shadow-lg"
          >
            <h2 className="text-lg font-semibold">Create a Team</h2>

            <input
              required
              name="name"
              placeholder="Team name"
              className="w-full border rounded p-2"
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
                Create
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 space-y-4">
            <h2 className="text-lg font-semibold">Team Created 🎉</h2>

            <p className="text-sm text-gray-600">Share this invite code:</p>

            <div className="p-2 bg-gray-100 rounded text-center font-mono text-lg tracking-widest">
              {state.joinCode}
            </div>

            <button
              onClick={copyCode}
              className={`w-full py-2 rounded text-white transition 
                ${copied ? "bg-green-600" : "bg-blue-600"}`}
            >
              {copied ? "Copied!" : "Copy Code"}
            </button>

            <button
              onClick={close}
              className="w-full py-2 rounded bg-neutral-200"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </>
  )
}
