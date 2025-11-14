import type { RawSearchParams } from "@/app/contacts/types"

export default function FilterForm({ sp }: { sp: RawSearchParams }) {
  const q = sp.q ?? ""
  const sort = sp.sort ?? "name"
  const dir = sp.dir ?? "asc"
  const fRole = sp.r ?? ""
  const fObj = sp.o ?? ""
  const wf_from = sp.wf_from ?? ""
  const wt_to = sp.wt_to ?? ""
  const fStatus = sp.status ?? ""
  const onlyFav = sp.fav === "1"
  const onlyBl = sp.bl === "1"

  return (
    <form
      method="GET"
      className="rounded-2xl border p-4 grid grid-cols-1 md:grid-cols-12 gap-3"
    >
      <div className="md:col-span-8">
        <label className="block text-sm font-medium mb-1">Search</label>
        <input
          id="q"
          name="q"
          defaultValue={q}
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
              <label className="block text-sm mb-1">Role contains</label>
              <input
                name="r"
                defaultValue={fRole}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm mb-1">Object contains</label>
              <input
                name="o"
                defaultValue={fObj}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm mb-1">Status</label>
              <select
                name="status"
                defaultValue={fStatus}
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
  )
}
