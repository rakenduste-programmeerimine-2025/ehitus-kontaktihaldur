import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import EditContact from "@/components/contacts/edit-contact"
import { getContactWithHistory } from "@/app/contacts/data"

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const sb = await createClient()

  const { id } = await params
  const contactId = Number(id)

  if (!contactId) redirect("/contacts")

  const {
    data: { session },
  } = await sb.auth.getSession()
  if (!session) redirect("/auth/login")

  const { contact, history } = await getContactWithHistory(contactId)
  if (!contact) redirect("/contacts")

  const { data: objects } = await sb
    .from("object")
    .select("id, name")
    .order("name")

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Edit Contact</h1>

      <EditContact
        contact={contact}
        history={history}
        objects={objects ?? []}
      />
    </div>
  )
}
