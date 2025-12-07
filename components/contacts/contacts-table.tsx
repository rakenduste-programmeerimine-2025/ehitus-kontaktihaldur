import Link from "next/link"
import { fmt, workingStatus } from "@/app/contacts/utils"
import { toggleFavorite } from "@/app/contacts/actions"
import type { Contact } from "@/app/contacts/types"
import { Star } from "lucide-react"

export default function ContactsTable({ contacts }: { contacts: Contact[] }) {
  return (
    <div className="rounded-2xl border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="text-left p-3 w-[36px]">Favorite</th>
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

            const workingPeriod =
              c.workingfrom || c.workingto
                ? `${fmt(c.workingfrom)}${
                    c.workingfrom || c.workingto ? " – " : ""
                  }${fmt(c.workingto)}`
                : ""

            return (
              <tr
                key={c.id}
                className="border-t"
              >
                <td className="p-3">
                  <form
                    action={toggleFavorite}
                    className="flex items-center"
                  >
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

                    <button className="rounded p-1 hover:bg-muted">
                      {c.isfavorite ? (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                      ) : (
                        <Star className="h-4 w-4 text-gray-300" />
                      )}
                    </button>
                  </form>
                </td>

                <td className="p-3 font-medium">
                  <Link
                    href={`/contacts/${c.id}`}
                    className="hover:underline"
                  >
                    {c.name}
                  </Link>
                </td>

                <td className="p-3 text-muted-foreground">{c.roles || ""}</td>

                <td className="p-3 text-muted-foreground">{c.objects || ""}</td>

                <td className="p-3 text-muted-foreground">{workingPeriod}</td>

                <td className="p-3">
                  {status === "Active" && (
                    <span className="inline-flex items-center rounded bg-emerald-600 text-white px-2 py-0.5 text-xs">
                      Active
                    </span>
                  )}

                  {status === "Passive" && (
                    <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs">
                      Passive
                    </span>
                  )}
                </td>

                <td className="p-3">
                  {c.isblacklist ? (
                    <span className="inline-flex items-center rounded bg-red-600 text-white px-2 py-0.5 text-xs">
                      Blacklisted
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs">
                      Whitelisted
                    </span>
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