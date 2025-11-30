"use client"

import { useTransition } from "react"
import { changeRole } from "@/app/teams/actions"
import { RemoveMemberButton } from "./remove-member-button"

type MemberRow = {
  id: number
  user_id: string
  email: string
  name: string
  role: string
  status: string
  joined_at: string
}

const roles = ["ADMIN", "EDITOR", "VIEWER"]

export function TeamMemberRow({
  m,
  teamId,
  currentUserId,
  currentUserRole,
  canEditRoles,
}: {
  m: MemberRow
  teamId: number
  currentUserId: string
  currentUserRole: string
  canEditRoles?: boolean
}) {
  const [isPending, startTransition] = useTransition()

  const isSelf = m.user_id === currentUserId
  const isCurrentUserAdmin = currentUserRole === "ADMIN"

  const canEdit = canEditRoles && isCurrentUserAdmin && !isSelf
  const isTargetAdmin = m.role === "ADMIN"

  return (
    <tr className="border-b">
      <td className="px-4 py-3 font-medium">{m.name}</td>
      <td className="px-4 py-3">{m.email}</td>

      <td className="px-4 py-3">
        {canEdit ? (
          <select
            defaultValue={m.role}
            disabled={isPending}
            className="border px-2 py-1 rounded text-sm"
            onChange={e =>
              startTransition(async () => {
                await changeRole(m.id, e.target.value)
              })
            }
          >
            {roles.map(r => (
              <option
                key={r}
                value={r}
              >
                {isPending && r === m.role ? "Saving…" : r}
              </option>
            ))}
          </select>
        ) : (
          <span>{m.role}</span>
        )}
      </td>

      <td className="px-4 py-3">{m.status}</td>

      <td className="px-4 py-3 text-neutral-500">
        {new Date(m.joined_at).toLocaleString()}
      </td>

      <td className="px-4 py-3 text-right">
        {isCurrentUserAdmin && !isSelf && (
          <RemoveMemberButton
            memberId={m.id}
            teamId={teamId}
            disabled={isTargetAdmin}
            isAdminTarget={isTargetAdmin}
            onSuccess={() => {}}
          />
        )}
      </td>
    </tr>
  )
}
