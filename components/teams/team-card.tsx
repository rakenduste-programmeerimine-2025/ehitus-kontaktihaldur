"use client"

import { useRouter } from "next/navigation"

type Props = {
  team: {
    id: number
    name: string
    role: string
    status: string
  }
}

export default function TeamCard({ team }: Props) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/team/${team.id}`)}
      className="
        cursor-pointer rounded-xl p-5 border border-neutral-200
        bg-white/80 backdrop-blur-sm
        shadow-sm hover:shadow-lg
        transition-all duration-200 hover:-translate-y-[2px]
      "
    >
      <h2 className="text-lg font-bold text-neutral-900">{team.name}</h2>

      <p className="text-sm text-neutral-600 mt-2">
        <span className="font-medium">Role:</span> {team.role}
      </p>

      <p className="text-sm text-neutral-700">
        <span className="font-medium">Status:</span> {team.status}
      </p>
    </div>
  )
}
