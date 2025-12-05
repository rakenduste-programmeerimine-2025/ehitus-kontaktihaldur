// app/objects/[id]/page.tsx
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { fmt, objectStatus } from "@/app/objects/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, DollarSign } from "lucide-react"
import ObjectTasks from "@/components/objects/object-tasks"

export default async function ObjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const idNum = Number(id)
  if (isNaN(idNum) || idNum <= 0) notFound()

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect("/auth/login")

  const { data: object } = await supabase
    .from("object")
    .select("*")
    .eq("id", idNum)
    .single()
    .then(r => r.error || !r.data ? notFound() : r)

  const { data: workers } = await supabase
    .from("object_with_workers")
    .select("contact, contactid, ispaid")
    .eq("id", idNum)

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, is_done, repeat_type, repeat_interval, next_due_date")
    .eq("object_id", idNum)
    .order("next_due_date", { ascending: true, nullsLast: true })
    .order("is_done", { ascending: true })

  const status = objectStatus(object)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{object.name ?? "Unnamed Object"}</h1>
          <p className="text-muted-foreground mt-1">
            ID: <code className="bg-muted px-1 rounded text-xs">{object.id}</code>
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/objects/${object.id}/edit`}>Edit</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/objects">Back to List</Link>
          </Button>
        </div>
      </div>

      {/* Object Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div><h2 className="text-sm font-medium text-muted-foreground">Address</h2><p className="mt-1">{object.location ?? "—"}</p></div>
          <div><h2 className="text-sm font-medium text-muted-foreground">Period</h2><p className="mt-1">{fmt(object.startdate)} to {fmt(object.enddate)}</p></div>
          <div><h2 className="text-sm font-medium text-muted-foreground">Status</h2><Badge variant={status.variant}>{status.text}</Badge></div>
          <div><h2 className="text-sm font-medium text-muted-foreground">Description</h2><p className="mt-1 whitespace-pre-wrap">{object.description ?? "—"}</p></div>
        </div>
      </div>

      {/* Workers Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" /> Workers on Site
              <Badge variant="outline" className="ml-2">{workers?.length ?? 0}</Badge>
            </CardTitle>
            <Button asChild variant="default" size="sm">
              <Link href={`/objects/${object.id}/workers`}>Manage Workers</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Your existing worker list */}
        </CardContent>
      </Card>

      {/* NEW: Reusable Task Component */}
      <ObjectTasks objectId={object.id} tasks={tasks || []} />
    </div>
  )
}