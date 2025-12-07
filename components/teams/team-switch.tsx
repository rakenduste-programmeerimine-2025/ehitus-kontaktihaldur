"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTeam } from "@/components/team-context"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { ChevronDown, UsersRound, User2 } from "lucide-react"
import { useRouter } from "next/navigation"

export type SimpleTeam = { id: number; name: string }

type MemberRow = {
  team_id: number
  team: { id: number; name: string } | null
  status: { name: string } | null
}

export function TeamSwitcher() {
  const supabase = createClient()
  const { activeTeam, setActiveTeam, setTeamRole } = useTeam()

  const [teams, setTeams] = useState<SimpleTeam[]>([])
  const [loading, setLoading] = useState(true)

  const [userLoaded, setUserLoaded] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()


  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id ?? null
      setUserId(uid)
      setUserLoaded(true)

      if (!uid) {
        setTeams([])
        setLoading(false)
        return
      }

      const result = await supabase
        .from("team_member")
        .select(`
          team_id,
          team:team_id ( id, name ),
          status:status_id ( name )
        `)
        .eq("user_id", uid)

      const rows = (result.data ?? []) as unknown as MemberRow[]

      const approved = rows
        .filter(r => r.status?.name === "APPROVED" && r.team !== null)
        .map(r => ({ id: r.team!.id, name: r.team!.name }))

      const unique = Array.from(new Map(approved.map(t => [t.id, t])).values())

      setTeams(unique)
      setLoading(false)
    }

    load()
  }, [supabase])

  if (!userLoaded || !userId) return null

  const currentLabel = activeTeam?.name || "Personal"

async function switchTo(team: SimpleTeam | null) {
  setActiveTeam(team)

  const params = new URLSearchParams(window.location.search)
  if (team) params.set("team", String(team.id))
  else params.delete("team")

  window.history.replaceState(null, "", `?${params.toString()}`)

  router.refresh()

  if (!team) {
    setTeamRole(null)
    return
  }

const { data } = await supabase
  .from("team_member")
  .select("role:role_id ( name )")
  .eq("team_id", team.id)
  .eq("user_id", userId)
  .single()

const roleData = Array.isArray(data?.role)
  ? data.role[0]
  : data?.role

const role = roleData?.name?.toUpperCase() ?? null

setTeamRole(role)


}

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="w-full flex items-center justify-between px-3 py-2 border rounded-md bg-muted hover:bg-muted/70 text-sm">
          <span className="flex items-center gap-2 text-left">
            {activeTeam ? (
              <UsersRound className="w-4 h-4 text-blue-500" />
            ) : (
              <User2 className="w-4 h-4 text-neutral-600" />
            )}
            {currentLabel}
          </span>
          <ChevronDown className="w-4 h-4 opacity-60" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-56 p-2 z-[9999]">
        <button
          onClick={() => switchTo(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent text-left ${
            activeTeam === null ? "bg-accent font-medium" : ""
          }`}
        >
          <User2 className="h-4 w-4" />
          Personal
        </button>

        <div className="my-2 border-t" />

        {loading ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            Loading…
          </div>
        ) : (
          teams.map(team => (
            <button
              key={`team-${team.id}`}
              onClick={() => switchTo(team)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent text-left ${
                activeTeam?.id === team.id ? "bg-accent font-medium" : ""
              }`}
            >
              <UsersRound className="h-4 w-4" />
              {team.name}
            </button>
          ))
        )}
      </PopoverContent>
    </Popover>
  )
}
