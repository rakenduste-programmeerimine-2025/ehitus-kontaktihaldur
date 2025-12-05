
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import WorkersManager from "@/components/objects/workers-manager"
import { Button } from "@/components/ui/button";
import Link from "next/link"

export default async function ObjectWorkersPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const objectId = Number(id)
  if (isNaN(objectId)) notFound()

  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect("/auth/login")

  // Fetch object name (for title)
  const { data: object } = await supabase
    .from("object")
    .select("name")
    .eq("id", objectId)
    .single()

  if (!object) notFound()

  // kõik kontaktid
  const { data: allContacts } = await supabase
    .from("contacts")
    .select("id, name")
    .order("name", { ascending: true })

  //  hetketöötajad
  const { data: currentWorkers } = await supabase
    .from("workingon")
    .select("fk_contact_id")
    .eq("fk_object_id", objectId)

  const currentContactIds = new Set(currentWorkers?.map(w => w.fk_contact_id) || [])

return (
  <div className="mx-auto max-w-4xl px-4 py-10">
    <div className="mb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Workers</h1>
          <p className="text-muted-foreground mt-2">
            Object: <span className="font-medium">{object.name}</span>
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href={`/objects/${objectId}`}>
            Back to Object
          </Link>
        </Button>
      </div>
    </div>

    <WorkersManager
      objectId={objectId}
      allContacts={allContacts || []}
      currentContactIds={currentContactIds}
    />
  </div>
)
}