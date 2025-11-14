import { fmt, workingStatus } from "@/app/contacts/utils"
import { toggleFavorite } from "@/app/contacts/actions"
import type { Contact } from "@/app/contacts/types"

export default function ContactsTable({ contacts }: { contacts: Contact[] }) {
  return (
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
          {contacts.map(c => {
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
                    <button className="rounded px-2 py-1 hover:bg-muted">
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

                <td className="p-3 text-muted-foreground">{c.roles ?? "—"}</td>
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

          {contacts.length === 0 && (
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
  )
}
