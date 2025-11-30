"use client"

import { useTransition } from "react"
import { changeRole } from "@/app/teams/actions"

const roles = ["ADMIN", "EDITOR", "VIEWER"]

export function RoleDropdown({
  memberId,
  currentRole,
  disabled,
}: {
  memberId: number
  currentRole: string
  disabled: boolean
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      className="border px-2 py-1 rounded text-sm"
      defaultValue={currentRole}
      disabled={disabled || isPending}
      onChange={e =>
        startTransition(async () => {
          await changeRole(memberId, e.target.value)
        })
      }
    >
      {roles.map(r => (
        <option
          key={r}
          value={r}
        >
          {isPending && r === currentRole ? "Saving…" : r}
        </option>
      ))}
    </select>
  )
}
