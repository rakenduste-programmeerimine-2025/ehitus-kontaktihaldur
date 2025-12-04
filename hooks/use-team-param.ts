"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { useTeam } from "@/components/team-context"

export function useTeamParam() {
  const { activeTeam } = useTeam()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (!activeTeam) return

    const params = new URLSearchParams(searchParams.toString())

    if (!params.get("team")) {
      params.set("team", String(activeTeam.id))
      router.replace(`${pathname}?${params.toString()}`)
    }
  }, [pathname, activeTeam, searchParams, router])
}
