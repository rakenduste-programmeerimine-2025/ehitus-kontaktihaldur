import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export type Contact = {
  id: number
  created_at: string | null
  name: string
  roles: string | null
  objects: string | null
  email: string | null
  number: string | null
  birthday: string | null
  cost: number | null
  workingfrom: string | null
  workingto: string | null
  isfavorite: boolean
  isblacklist: boolean
}

type SP = Promise<{
  q?: string
  sort?:
    | "name"
    | "created_at"
    | "workingfrom"
    | "workingto"
    | "roles"
    | "objects"
  dir?: "asc" | "desc"
  status?: "active" | "passive" | "unknown"
  r?: string
  o?: string
  wf_from?: string
  wt_to?: string
  fav?: "1"
  bl?: "1"
}>

function toBool(v: FormDataEntryValue | null): boolean | null {
  if (v === null) return null
  const s = v.toString().trim().toLowerCase()
  if (s === "true" || s === "1" || s === "on") return true
  if (s === "false" || s === "0") return false
  return null
}

function fmt(d?: string | null) {
  if (!d) return "—"
  const x = new Date(d)
  if (Number.isNaN(x.valueOf())) return d!
  return x.toLocaleDateString()
}

function workingStatus(c: Contact) {
  if (!c.workingfrom && !c.workingto) return "Unknown"
  const today = new Date()
  const fromOk = c.workingfrom ? new Date(c.workingfrom) <= today : true
  const toOk = c.workingto ? today <= new Date(c.workingto) : true
  return fromOk && toOk ? "Active" : "Passive"
}

async function toggleFavorite(formData: FormData) {
  "use server"
  const sb = await createClient()
  const id = (formData.get("id") ?? "").toString()
  const value = !!toBool(formData.get("value"))
  if (!id) return
  const { error } = await sb
    .from("contacts")
    .update({ isfavorite: value })
    .eq("id", id)
  if (error) throw error
  revalidatePath("/contacts")
}

export default async function ContactsPage({
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
  const fRole = (sp?.r ?? "").trim()
  const fObj = (sp?.o ?? "").trim()
  const wf_from = (sp?.wf_from ?? "").trim()
  const wt_to = (sp?.wt_to ?? "").trim()
  const onlyFav = sp?.fav === "1"
  const onlyBl = sp?.bl === "1"

  let query = supabase.from("contacts_with_details").select("*")

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,roles.ilike.%${q}%,objects.ilike.%${q}%,email.ilike.%${q}%,number.ilike.%${q}%`,
    )
  }

  if (fRole) query = query.ilike("roles", `%${fRole}%`)
  if (fObj) query = query.ilike("objects", `%${fObj}%`)
  if (wf_from) query = query.or(`workingto.is.null,workingto.gte.${wf_from}`)
  if (wt_to) query = query.or(`workingfrom.is.null,workingfrom.lte.${wt_to}`)

  if (fStatus) {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, "0")
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate(),
    )}`

    if (fStatus === "active") {
      query = query.or(`workingfrom.is.null,workingfrom.lte.${today}`)
      query = query.or(`workingto.is.null,workingto.gte.${today}`)
    } else if (fStatus === "passive") {
      query = query.or(`workingfrom.gt.${today},workingto.lt.${today}`)
    } else if (fStatus === "unknown") {
      query = query.is("workingfrom", null).is("workingto", null)
    }
  }

  if (onlyFav) query = query.eq("isfavorite", true)
  if (onlyBl) query = query.eq("isblacklist", true)

  query = query.order(sort, { ascending: dir === "asc", nullsFirst: true })

  const { data: contacts, error } = await query
  if (error) throw error

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contacts list</h1>
        <div className="flex gap-2">
          <a
            href="/api/contacts/export"
            className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
          >
            Export data
          </a>
          <button
            type="button"
            title="Add Contact (disabled)"
            aria-disabled="true"
            className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground opacity-60 cursor-default"
          >
            Add Contact
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
            placeholder="Search name, role, object, email or number…"
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
              <option value="roles">Role</option>
              <option value="objects">Object</option>
              <option value="created_at">Created</option>
              <option value="workingfrom">Working from</option>
              <option value="workingto">Working to</option>
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
                  htmlFor="r"
                  className="block text-sm mb-1"
                >
                  Role contains
                </label>
                <input
                  id="r"
                  name="r"
                  defaultValue={fRole}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-3">
                <label
                  htmlFor="o"
                  className="block text-sm mb-1"
                >
                  Object contains
                </label>
                <input
                  id="o"
                  name="o"
                  defaultValue={fObj}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>
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
              <div className="md:col-span-3 flex items-end gap-4">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="fav"
                    value="1"
                    defaultChecked={onlyFav}
                  />
                  Favorites
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="bl"
                    value="1"
                    defaultChecked={onlyBl}
                  />
                  Blacklist
                </label>
              </div>
              <div className="md:col-span-12">
                <span className="block text-sm mb-1">Working period</span>
                <div className="flex gap-2">
                  <input
                    name="wf_from"
                    type="date"
                    defaultValue={wf_from}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                  <input
                    name="wt_to"
                    type="date"
                    defaultValue={wt_to}
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
              <th className="text-left p-3 w-[36px]">★</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Object</th>
              <th className="text-left p-3">Working period</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Blacklisted</th>
            </tr>
          </thead>
          <tbody>
            {(contacts ?? []).map(c => {
              const status = workingStatus(c)
              return (
                <tr
                  key={c.id}
                  className="border-t"
                >
                  <td className="p-3">
                    <form action={toggleFavorite}>
                      <input
                        type="hidden"
                        name="id"
                        value={c.id}
                      />
                      <input
                        type="hidden"
                        name="value"
                        value={(!c.isfavorite).toString()}
                      />
                      <button
                        className="rounded px-2 py-1 hover:bg-muted"
                        title={c.isfavorite ? "Unfavorite" : "Favorite"}
                      >
                        {c.isfavorite ? "★" : "☆"}
                      </button>
                    </form>
                  </td>
                  <td className="p-3 font-medium">
                    <div>{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.email ?? "—"} · {c.number ?? "—"}
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {c.roles ?? "—"}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {c.objects ?? "—"}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {fmt(c.workingfrom)} – {fmt(c.workingto)}
                  </td>
                  <td className="p-3">
                    {status === "Active" ? (
                      <span className="inline-flex items-center rounded bg-emerald-600 text-white px-2 py-0.5 text-xs">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs">
                        Passive
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {c.isblacklist ? (
                      <span className="inline-flex items-center rounded bg-red-600 text-white px-2 py-0.5 text-xs">
                        Yes
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {(!contacts || contacts.length === 0) && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center p-8 text-muted-foreground"
                >
                  No contacts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
