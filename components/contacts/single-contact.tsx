import Link from "next/link"
import type { Contact, ObjectHistoryRow } from "@/app/contacts/types"
import { fmt, workingStatus } from "@/app/contacts/utils"
import { toggleBlacklist, deleteContact } from "@/app/contacts/actions"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { ObjectHistory } from "@/components/contacts/object-history"
import { Star } from "lucide-react"

type Props = {
  contact: Contact
  history: ObjectHistoryRow[]
}

export function SingleContact({ contact: c, history }: Props) {
  const status = workingStatus(c)

  const workingPeriod =
    c.workingfrom || c.workingto
      ? `${fmt(c.workingfrom)}${c.workingfrom || c.workingto ? " – " : ""}${fmt(
          c.workingto,
        )}`
      : ""

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-2">
        <Button
          variant="ghost"
          asChild
          className="-ml-3 h-auto p-2 text-muted-foreground hover:text-foreground font-normal"
        >
          <Link
            href="/contacts"
            className="inline-flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to contacts
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold">{c.name}</h1>

          {c.isfavorite && (
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-500" />
          )}
        </div>

        <div className="flex items-center gap-2">
          <form action={toggleBlacklist}>
            <input
              type="hidden"
              name="id"
              value={String(c.id)}
            />
            <input
              type="hidden"
              name="value"
              value={(!c.isblacklist).toString()}
            />

            <button
              type="submit"
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              {c.isblacklist ? "Remove from Blacklist" : "Add to Blacklist"}
            </button>
          </form>

          <Link
            href={`/contacts/${c.id}/edit`}
            className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm hover:bg-primary/90"
          >
            Edit Contact
          </Link>

          <form action={deleteContact}>
            <input
              type="hidden"
              name="id"
              value={String(c.id)}
            />
            <input
              type="hidden"
              name="name"
              value={c.name}
            />
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-red-600 text-white px-3 py-2 text-sm hover:bg-red-700"
            >
              Delete Contact
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border p-6 space-y-4">
          <h2 className="text-lg font-medium">General Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Full Name</div>
              <div>{c.name}</div>
            </div>

            <div>
              <div className="text-muted-foreground text-xs">Email</div>
              <div>{c.email || ""}</div>
            </div>

            <div>
              <div className="text-muted-foreground text-xs">Phone Number</div>
              <div>{c.number || ""}</div>
            </div>

            <div>
              <div className="text-muted-foreground text-xs">Role</div>
              <div>{c.roles || ""}</div>
            </div>

            <div>
              <div className="text-muted-foreground text-xs">Object</div>
              <div>{c.objects || ""}</div>
            </div>

            <div>
              <div className="text-muted-foreground text-xs">
                Working Period
              </div>
              <div>{workingPeriod}</div>
            </div>

            <div>
              <div className="text-muted-foreground text-xs">Status</div>
              <div className="mt-1">
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
              </div>
            </div>

            <div>
              <div className="text-muted-foreground text-xs">Cost</div>
              <div>{c.cost || ""}</div>
            </div>

            <div>
              <div className="text-muted-foreground text-xs">Blacklist</div>
              <div className="mt-1">
                {c.isblacklist ? (
                  <span className="inline-flex items-center rounded bg-red-600 text-white px-2 py-0.5 text-xs">
                    Blacklisted
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs">
                    Whitelisted
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <ObjectHistory history={history} />
      </div>
    </div>
  )
}
