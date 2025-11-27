"use client"

import { approveMember, rejectMember } from "@/app/teams/actions"
import { useTransition } from "react"

export type MemberRow = {
  id: number
  user_id: string
  email: string | null
  name: string | null
  role: string
  status: string
  joined_at: string
}

type Props = {
  m: MemberRow
}

export function PendingMemberRow({ m }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <tr className="border-b bg-yellow-50">
      <td className="px-4 py-3 font-medium">{m.name}</td>
      <td className="px-4 py-3">{m.email}</td>
      <td className="px-4 py-3">{m.role}</td>
      <td className="px-4 py-3">{m.status}</td>
      <td className="px-4 py-3">{new Date(m.joined_at).toLocaleString()}</td>

      <td className="px-4 py-3 flex gap-2">
        <button
          onClick={() =>
            startTransition(() => {
              approveMember(m.id)
            })
          }
          disabled={isPending}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          Approve
        </button>

        <button
          onClick={() =>
            startTransition(() => {
              rejectMember(m.id)
            })
          }
          disabled={isPending}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          Reject
        </button>
      </td>
    </tr>
  )
}
