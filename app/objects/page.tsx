import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export type Objekt = {
  id: number
  created_at: string | null
  name: string | null
  location: string | null
  description: string | null
  startdate: string | null
  enddate: string | null
  inactive: boolean | null
  user_id: string | null
}

type SP = Promise<{
  q?: string
  sort?: "name" | "location" | "startdate" | "enddate" | "created_at"
  dir?: "asc" | "desc"
  status?: "active" | "passive" | "unknown"
  period_from?: string
  period_to?: string
}>

function fmt(d?: string | null) {
  if (!d) return "—"
  const x = new Date(d)
  if (Number.isNaN(x.valueOf())) return d!
  return x.toLocaleDateString()
}

function objectStatus(obj: Objekt) {
  if (!obj.startdate && !obj.enddate) return "Unknown"
  const today = new Date()
  const fromOk = obj.startdate ? new Date(obj.startdate) <= today : true
  const toOk = obj.enddate ? today <= new Date(obj.enddate) : true
  return fromOk && toOk ? "Active" : "Passive"
}

export default async function ObjectsPage({
  searchParams,
}: {
  searchParams: SP
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) redirect("/auth/login")

  const sp = await searchParams
  const q = (sp?.q ?? "").trim()
  const sort = sp?.sort ?? "name"
  const dir = (sp?.dir ?? "asc") === "desc" ? "desc" : "asc"

  const fStatus = sp?.status
  const period_from = (sp?.period_from ?? "").trim()
  const period_to = (sp?.period_to ?? "").trim()

  let query = supabase.from("object").select("*")

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,location.ilike.%${q}%,description.ilike.%${q}%`,
    )
  }

  if (period_from)
    query = query.or(`enddate.is.null,enddate.gte.${period_from}`)
  if (period_to)
    query = query.or(`startdate.is.null,startdate.lte.${period_to}`)

  if (fStatus) {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, "0")
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate(),
    )}`

    if (fStatus === "active") {
      query = query.or(`startdate.is.null,startdate.lte.${today}`)
      query = query.or(`enddate.is.null,enddate.gte.${today}`)
    } else if (fStatus === "passive") {
      query = query.or(`startdate.gt.${today},enddate.lt.${today}`)
    } else if (fStatus === "unknown") {
      query = query.is("startdate", null).is("enddate", null)
    }
  }

  query = query.order(sort, { ascending: dir === "asc", nullsFirst: true })

  const { data: objects, error } = await query
  if (error) throw error

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

      <form
        method="GET"
        className="rounded-2xl border p-4 grid grid-cols-1 md:grid-cols-12 gap-3"
      >
        <div className="md:col-span-8">
          <label
            htmlFor="q"
            className="block text-sm font-medium mb-1"
          >
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Search by name, address, or description…"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="md:col-span-4">
          <label className="block text-sm font-medium mb-1">Sort</label>
          <div className="flex gap-2">
            <select
              name="sort"
              defaultValue={sort}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="name">Name</option>
              <option value="location">Address</option>
              <option value="startdate">Start Date</option>
              <option value="enddate">End Date</option>
              <option value="created_at">Created</option>
            </select>
            <select
              name="dir"
              defaultValue={dir}
              className="w-[110px] rounded-md border px-3 py-2 text-sm"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-12">
          <details className="rounded-md border p-3 bg-muted/30">
            <summary className="cursor-pointer text-sm font-medium">
              Filters
            </summary>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-3">
              <div className="md:col-span-3">
                <label
                  htmlFor="status"
                  className="block text-sm mb-1"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={fStatus ?? ""}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="passive">Passive</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div className="md:col-span-9">
                <span className="block text-sm mb-1">Object period</span>
                <div className="flex gap-2">
                  <input
                    name="period_from"
                    type="date"
                    defaultValue={period_from}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                  <input
                    name="period_to"
                    type="date"
                    defaultValue={period_to}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </details>
        </div>

        <div className="md:col-span-12">
          <button className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">
            Apply
          </button>
        </div>
      </form>

      <div className="rounded-2xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Address</th>
              <th className="text-left p-3">Description</th>
              <th className="text-left p-3">Period</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(objects ?? []).map(obj => {
              const status = objectStatus(obj)
              return (
                <tr
                  key={obj.id}
                  className="border-t"
                >
                  <td className="p-3 font-medium">{obj.name ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">
                    {obj.location ?? "—"}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {obj.description ?? "—"}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {fmt(obj.startdate)} – {fmt(obj.enddate)}
                  </td>

                  {/* --- SEE ON MUUDETUD OSA --- */}
                  <td className="p-3">
                    {status === "Active" ? (
                      <span className="inline-flex items-center rounded bg-emerald-600 text-white px-2 py-0.5 text-xs">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs">
                        {/* Nüüd kuvatakse siin "Passive" või "Unknown" (hallil taustal), 
                          mitte "Passive" (punasel) ja "Unknown" (hallil).
                          See on ka parandus võrreldes teie algse kontaktide koodiga, 
                          mis oleks "Unknown" staatuse korral valesti "Passive" nime näidanud.
                        */}
                        {status}
                      </span>
                    )}
                  </td>
                  {/* --- MUUDATUSE LÕPP --- */}
                </tr>
              )
            })}
            {(!objects || objects.length === 0) && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center p-8 text-muted-foreground"
                >
                  No objects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
