import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SingleContact } from "@/components/contacts/single-contact"
import { getContactWithHistory } from "@/app/contacts/data"

type SingleContactPageProps = {
  params: { id: string } | Promise<{ id: string }>
}

export default async function SingleContactPage({
  params,
}: SingleContactPageProps) {
  const resolvedParams = await params
  const idNum = Number(resolvedParams.id)

  if (!resolvedParams.id || Number.isNaN(idNum)) {
    redirect("/contacts")
  }

  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  const { contact, history } = await getContactWithHistory(idNum)

  if (!contact) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8 space-y-4">
        <div>
          <Link
            href="/contacts"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to contacts
          </Link>
        </div>
        <h1 className="text-2xl font-semibold">Contact not found</h1>
      </div>
    )
  }

  return (
    <SingleContact
      contact={contact}
      history={history}
    />
  )
}
