import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TeamCard from "@/components/teams/team-card"
import CreateTeamCard from "@/components/teams/create-team-card"
import JoinTeamCard from "@/components/teams/join-team-card"
import NoTeamState from "@/components/teams/no-team-state"

type JoinedTeamRow = {
  team: { id: number; name: string } | null
  role: { name: string } | null
  status: { name: string } | null
}

type UserTeam = {
  id: number
  name: string
  role: string
  status: string
}

async function fetchTeams(userId: string): Promise<UserTeam[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("team_member")
    .select(
      `
      team:team_id ( id, name ),
      role:role_id ( name ),
      status:status_id ( name )
    `,
    )
    .eq("user_id", userId)

  if (error) {
    console.error("Failed to fetch teams:", error)
    return []
  }

  return (data ?? [])
    .map(row => row as unknown as JoinedTeamRow)
    .filter(row => row.team !== null)
    .map(row => ({
      id: row.team!.id,
      name: row.team!.name,
      role: row.role?.name ?? "",
      status: row.status?.name ?? "",
    }))
}

export default async function TeamsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const teams = await fetchTeams(user.id)

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b p-6">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-neutral-500 mt-2 text-sm">
            Manage your construction teams, members, and collaboration settings.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <CreateTeamCard />
          <JoinTeamCard />
        </div>

        {teams.length === 0 ? (
          <div className="flex justify-center">
            <NoTeamState />
          </div>
        ) : (
          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-neutral-700 mb-4">
              Your Teams
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map(team => (
                <TeamCard
                  key={team.id}
                  team={team}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
