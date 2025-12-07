
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import EditObjectForm from "@/components/objects/edit-object-form"
import DeleteObjectButton from "@/components/objects/delete-object-button"


export default async function ObjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>   
}) {

  const { id } = await params
  const idNum = Number(id)

  if (isNaN(idNum)) notFound()

  const supabase = await createClient()

  // Auth
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect("/auth/login")

  // Fetch object
  const { data: object, error } = await supabase
    .from("object")
    .select("id, name, location, description, startdate, enddate, isactive")
    .eq("id", idNum)
    .single()

  if (error || !object) notFound()

  return (
    <>


      <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Object</h1>
          <DeleteObjectButton objectId={object.id} objectName={object.name} />
        </div>

        <EditObjectForm object={object} />
      </div>
    </>
  )
}