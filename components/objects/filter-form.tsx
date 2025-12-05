import type { RawSearchParams } from "@/app/objects/types"
import Link from "next/link"

export default function FilterForm({ sp }: { sp: RawSearchParams }) {
  const q = sp.q ?? ""
  const sort = sp.sort ?? "name"
  const dir = sp.dir ?? "asc"
  const fStatus = sp.status ?? ""
  const period_from = sp.period_from ?? ""
  const period_to = sp.period_to ?? ""

  return (
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
                defaultValue={fStatus}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="passive">Passive</option>
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

      <div className="md:col-span-12 flex gap-3">
        <button className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">
          Apply
        </button>

        <Link
          href="/objects"
          className="rounded-md px-3 py-2 text-sm border hover:bg-muted"
        >
          Clear filters
        </Link>
      </div>
    </form>
  )
}
