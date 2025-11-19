import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AddContactForm from "@/components/contacts/add-contact"

export default async function AddContactPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  const { data: objects, error } = await supabase
    .from("object")
    .select("id, name")
    .order("name")

  if (error) throw error

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Add Contact</h1>
      <AddContactForm objects={objects ?? []} />
    </div>
  )
}
