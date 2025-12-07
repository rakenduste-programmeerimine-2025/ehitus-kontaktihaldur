"use client"

import { useRouter } from "next/navigation"
import type { Database } from "@/lib/supabase/types" // adjust if you have types

type Object = Database["public"]["Tables"]["object"]["Row"]

interface ObjectsTableProps {
  objects: Object[]
}

export default function ObjectsTable({ objects }: ObjectsTableProps) {
  const router = useRouter()

  if (objects.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No objects found.
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="text-left p-4 font-medium">Name</th>
            <th className="text-left p-4 font-medium">Address</th>
            <th className="text-left p-4 font-medium">Start Date</th>
            <th className="text-left p-4 font-medium">End Date</th>
            <th className="text-left p-4 font-medium">Status</th>
          </tr>
        </thead>

        <tbody>
          {objects.map((obj) => (
            <tr
              key={obj.id}
              className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
              role="link"
              tabIndex={0}
              onClick={() => router.push(`/objects/${obj.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  router.push(`/objects/${obj.id}`)
                }
              }}
            >
              <td className="p-4 font-medium">{obj.name}</td>
              <td className="p-4">{obj.location || "—"}</td>
              <td className="p-4">{obj.startdate || "—"}</td>
              <td className="p-4">{obj.enddate || "—"}</td>
              <td className="p-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    obj.isactive
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {obj.isactive ? "Active" : "Inactive"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}