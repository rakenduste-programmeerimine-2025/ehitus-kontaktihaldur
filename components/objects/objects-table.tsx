import type { Objekt } from "@/app/objects/types"
import { fmt, objectStatus } from "@/app/objects/utils"
import Link from "next/link"

export default function ObjectsTable({ objects }: { objects: Objekt[] }) {
  return (
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
          {objects.map((obj) => {
            const status = objectStatus(obj)

            return (
              // Wrap the whole <tr> with Link
              <Link
                key={obj.id}
                href={`/objects/${obj.id}`}
                className="contents" 
              >
                <tr
                  className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
                  role="link"
                  tabIndex={0}
                  aria-label={`View details for ${obj.name || "object"}`}
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
                  <td className="p-3">
                    {status === "Active" && (
                      <span className="inline-flex items-center rounded bg-emerald-600 text-white px-2 py-0.5 text-xs font-medium">
                        Active
                      </span>
                    )}
                    {status === "Passive" && (
                      <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-medium">
                        Passive
                      </span>
                    )}
                    {status === "—" && (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              </Link>
            )
          })}

          {objects.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-8 text-muted-foreground">
                No objects found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}