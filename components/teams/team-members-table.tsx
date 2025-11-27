"use client"

import { TeamMemberRow } from "./team-member-row"
import { PendingMemberRow } from "./pending-member-row"

type MemberRow = {
  id: number
  user_id: string
  email: string
  name: string
  role: string
  status: string
  joined_at: string
}

type Props = {
  title: string
  members: MemberRow[]
  pending?: boolean
}

export function TeamMembersTable({ title, members, pending = false }: Props) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      {members.length === 0 ? (
        <p className="text-neutral-500">No members.</p>
      ) : (
        <table className="w-full border rounded">
          <thead className="bg-neutral-100 font-semibold">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Joined</th>
              {pending && <th className="px-4 py-3 text-left">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {members.map((m) =>
              pending ? (
                <PendingMemberRow key={m.id} m={m} />
              ) : (
                <TeamMemberRow key={m.id} m={m} />
              )
            )}
          </tbody>
        </table>
      )}
    </section>
  )
}
