import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import FilterForm from "@/components/objects/filter-form"
import ObjectsTable from "@/components/objects/objects-table"
import { getObjects } from "./data"
import type { SearchParamsPromise } from "./types"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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

        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <a href="/api/objects/export">Export data</a>
          </Button>

          <Button asChild>
            <Link href="/objects/add">Add Object</Link>
          </Button>
        </div>
      </div>

      <FilterForm sp={sp} />
      <ObjectsTable objects={objects} />
    </div>
  )
}