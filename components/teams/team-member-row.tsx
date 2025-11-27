"use client"

type MemberRow = {
  id: number
  user_id: string
  email: string
  name: string
  role: string
  status: string
  joined_at: string
}

export function TeamMemberRow({ m }: { m: MemberRow }) {
  return (
    <tr className="border-b">
      <td className="px-4 py-3 font-medium">{m.name}</td>
      <td className="px-4 py-3">{m.email}</td>
      <td className="px-4 py-3">{m.role}</td>
      <td className="px-4 py-3">{m.status}</td>
      <td className="px-4 py-3 text-neutral-500">
        {new Date(m.joined_at).toLocaleString()}
      </td>
    </tr>
  )
}
