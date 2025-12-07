"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export type SimpleTeam = { id: number; name: string }

type TeamContextType = {
  activeTeam: SimpleTeam | null
  setActiveTeam: (team: SimpleTeam | null) => void
  teamRole: string | null
  setTeamRole: (role: string | null) => void
}

const TeamContext = createContext<TeamContextType>({
  activeTeam: null,
  setActiveTeam: () => {},
  teamRole: null,
  setTeamRole: () => {},
})

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const [activeTeam, setActiveTeam] = useState<SimpleTeam | null>(() => {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem("activeTeam")
    return raw ? JSON.parse(raw) : null
  })

  const [teamRole, setTeamRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser()
      setUserId(data.user?.id ?? null)
    }
    loadUser()
  }, [])

  useEffect(() => {
    if (activeTeam) {
      localStorage.setItem("activeTeam", JSON.stringify(activeTeam))
    } else {
      localStorage.removeItem("activeTeam")
    }
  }, [activeTeam])

  useEffect(() => {
    async function loadRole() {
      if (!userId || !activeTeam) {
        setTeamRole(null)
        return
      }

      const { data } = await supabase
        .from("team_member")
        .select("role:role_id ( name )")
        .eq("team_id", activeTeam.id)
        .eq("user_id", userId)
        .single()

      const roleObj = Array.isArray(data?.role)
        ? data.role[0]
        : data?.role

      const role = roleObj?.name?.toUpperCase() ?? null
      setTeamRole(role)
    }

    loadRole()
  }, [supabase, activeTeam, userId])

  return (
    <TeamContext.Provider
      value={{ activeTeam, setActiveTeam, teamRole, setTeamRole }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export const useTeam = () => useContext(TeamContext)
