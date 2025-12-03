"use client"

import { createContext, useContext, useState } from "react"

export type Team = {
  id: number
  name: string
} | null

type TeamContextType = {
  activeTeam: Team
  setActiveTeam: (team: Team) => void
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [activeTeam, setActiveTeam] = useState<Team>(null)

  return (
    <TeamContext.Provider value={{ activeTeam, setActiveTeam }}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error("useTeam must be used inside TeamProvider")
  return ctx
}
