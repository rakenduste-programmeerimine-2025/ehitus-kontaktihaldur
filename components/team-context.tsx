"use client"

import { createContext, useContext, useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

export type SimpleTeam = { id: number; name: string }

type TeamContextType = {
  activeTeam: SimpleTeam | null
  setActiveTeam: (team: SimpleTeam | null) => void
}

const TeamContext = createContext<TeamContextType>({
  activeTeam: null,
  setActiveTeam: () => {},
})

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const [activeTeam, setActiveTeam] = useState<SimpleTeam | null>(() => {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem("activeTeam")
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (activeTeam) {
      localStorage.setItem("activeTeam", JSON.stringify(activeTeam))
    } else {
      localStorage.removeItem("activeTeam")
    }
  }, [activeTeam])

  const previousUserId = useRef<string | null>(null)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const userId = session?.user?.id ?? null

        if (!userId) {
          previousUserId.current = null
          setActiveTeam(null)
          return
        }

        if (previousUserId.current === null) {
          previousUserId.current = userId
          return
        }

        if (previousUserId.current !== userId) {
          previousUserId.current = userId
          setActiveTeam(null)
          return
        }

      }
    )

    return () => listener.subscription.unsubscribe()
  }, [supabase])

  return (
    <TeamContext.Provider value={{ activeTeam, setActiveTeam }}>
      {children}
    </TeamContext.Provider>
  )
}

export const useTeam = () => useContext(TeamContext)
