import type { ObjectHistoryRow } from "@/app/contacts/types"
import { fmt } from "@/app/contacts/utils"

type Props = {
  history: ObjectHistoryRow[]
}

export function ObjectHistory({ history }: Props) {
  return (
    <div className="rounded-2xl border p-6 space-y-4">
      <h2 className="text-lg font-medium">Object History</h2>

      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">No object history.</p>
      ) : (
        <>
          <div className="grid grid-cols-4 text-xs text-muted-foreground mb-2">
            <div>Period</div>
            <div>Object</div>
            <div>Rating</div>
            <div>Review</div>
          </div>

          {history.map(row => (
            <div
              key={row.workingon_id}
              className="grid grid-cols-4 text-sm py-1 border-t"
            >
              <div>
                {fmt(row.from_date)} – {fmt(row.to_date)}
              </div>

              <div className="font-medium">{row.object_name ?? "—"}</div>

              <div>{row.rating != null ? row.rating : "—"}</div>

              <div>{row.reviewtext ?? "—"}</div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
