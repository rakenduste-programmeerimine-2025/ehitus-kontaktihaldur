import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import FilterForm from "@/components/objects/filter-form"
import ObjectsTable from "@/components/objects/objects-table"
import { getObjects } from "./data"
import type { SearchParamsPromise } from "./types"

export const dynamic = "force-dynamic"

export default async function ObjectsPage({
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
  const objects = await getObjects(sp)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Objects List</h1>
        <div className="flex gap-2">
          <a
            href="/api/objects/export"
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
          >
            Export data
          </a>
          <button
            type="button"
            title="Add Object (disabled)"
            aria-disabled="true"
            className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground opacity-60 cursor-default"
          >
            Add Object
          </button>
        </div>
      </div>

      <FilterForm sp={sp} />
      <ObjectsTable objects={objects} />
    </div>
  )
}
