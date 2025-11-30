import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { TeamMembersTable } from "@/components/teams/team-members-table"
import { RegenerateButton } from "@/components/teams/regenerate-button"
import { LeaveTeamButton } from "@/components/teams/leave-team-button"

function normalize<T>(rel: T | T[] | null): T | null {
  if (!rel) return null
  if (Array.isArray(rel)) return rel[0] ?? null
  return rel
}

export default async function SingleTeamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolved = await params
  const teamId = Number(resolved.id)

  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return <div>Not logged in</div>

  const { data: team } = await supabase
    .from("team")
    .select("id, name, invite_code")
    .eq("id", teamId)
    .single()

  if (!team) {
    return (
      <main className="p-6">
        <Link href="/teams">← Back to Teams</Link>
        <p className="text-red-600 mt-4">Team not found or access denied.</p>
      </main>
    )
  }

  const { data: rawMembers } = await supabase
    .from("team_member")
    .select(
      `
      id,
      user_id,
      joined_at,
      role:role_id ( name ),
      status:status_id ( name )
    `,
    )
    .eq("team_id", teamId)

  const { data: allUsers } = await admin.auth.admin.listUsers()

  const members =
    rawMembers?.map(row => {
      const user = allUsers.users.find(u => u.id === row.user_id)
      const roleObj = normalize(row.role)
      const statusObj = normalize(row.status)

      const fullName = `${user?.user_metadata?.first_name ?? ""} ${
        user?.user_metadata?.last_name ?? ""
      }`.trim()

      return {
        id: row.id,
        user_id: row.user_id,
        email: user?.email ?? "—",
        name: fullName || user?.email || "Unknown User",
        role: roleObj?.name ?? "",
        status: statusObj?.name ?? "",
        joined_at: row.joined_at,
      }
    }) ?? []

  const current = members.find(m => m.user_id === auth.user.id)

  if (!current) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <p className="text-red-600">You are not a member of this team.</p>
      </main>
    )
  }

  if (current.status === "PENDING") {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Membership Pending</h1>
        <p className="text-neutral-700">
          Your request to join <strong>{team.name}</strong> is awaiting admin
          approval.
        </p>
        <p className="mt-2 text-neutral-500">
          You will gain full access once your request is approved.
        </p>
      </main>
    )
  }

  const approved = members.filter(m => m.status === "APPROVED")
  const pending = members.filter(m => m.status === "PENDING")

  const isAdmin = current.role === "ADMIN"

  const adminCount = approved.filter(m => m.role === "ADMIN").length
  const memberCount = approved.length

  return (
    <main className="max-w-5xl mx-auto p-6">
      <Link
        href="/teams"
        className="text-blue-600 underline"
      >
        ← Back to Teams
      </Link>

      <h1 className="text-3xl font-bold mt-6">{team.name}</h1>

      <LeaveTeamButton
        teamId={team.id}
        isAdmin={current.role === "ADMIN"}
        isSoloAdmin={adminCount === 1}
        isOnlyMember={memberCount === 1}
      />

      {isAdmin && (
        <div className="mt-6 p-4 border rounded bg-blue-50">
          <h2 className="text-lg font-semibold mb-2">Team Invite Code</h2>

          <p className="text-neutral-700">
            Current code:{" "}
            <span className="font-mono font-bold">{team.invite_code}</span>
          </p>

          <RegenerateButton teamId={team.id} />
        </div>
      )}

      <TeamMembersTable
        title="Approved Members"
        members={approved}
      />

      {isAdmin && (
        <TeamMembersTable
          title="Pending Requests"
          members={pending}
          pending
        />
      )}
    </main>
  )
}
