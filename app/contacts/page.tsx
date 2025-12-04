import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import FilterForm from "@/components/contacts/filter-form"
import ContactsTable from "@/components/contacts/contacts-table"
import { getContacts } from "./data"
import type { SearchParamsPromise } from "./types"
import Link from "next/link"
import { ContactsAlerts } from "./ContactsAlerts"

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: SearchParamsPromise
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect("/auth/login")

  const sp = await searchParams
  const teamId = sp.team ?? null

  const contacts = await getContacts({
    ...sp,
    team: teamId,
  })

  return (
    <>
      <ContactsAlerts />

      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Contacts list</h1>

          <div className="flex gap-2 items-center">
            <form
              method="GET"
              action="/api/contacts/export"
            >
              <input
                type="hidden"
                name="q"
                value={sp.q || ""}
              />
              <input
                type="hidden"
                name="sort"
                value={sp.sort || "name"}
              />
              <input
                type="hidden"
                name="dir"
                value={sp.dir || "asc"}
              />
              <input
                type="hidden"
                name="r"
                value={sp.r || ""}
              />
              <input
                type="hidden"
                name="o"
                value={sp.o || ""}
              />
              <input
                type="hidden"
                name="status"
                value={sp.status || ""}
              />
              <input
                type="hidden"
                name="wf_from"
                value={sp.wf_from || ""}
              />
              <input
                type="hidden"
                name="wt_to"
                value={sp.wt_to || ""}
              />
              <input
                type="hidden"
                name="fav"
                value={sp.fav || ""}
              />
              <input
                type="hidden"
                name="bl"
                value={sp.bl || ""}
              />

              <button className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">
                Export data
              </button>
            </form>

            <Link
              href="/contacts/new"
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90"
            >
              Add Contact
            </Link>
          </div>
        </div>

        <FilterForm sp={sp} />
        <ContactsTable contacts={contacts} />
      </div>
    </>
  )
}
