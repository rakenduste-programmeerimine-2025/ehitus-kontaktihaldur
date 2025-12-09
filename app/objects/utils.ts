import type { Objekt } from "./types"

export function fmt(d?: string | null) {
  if (!d) return "—"
  const x = new Date(d)
  if (Number.isNaN(x.valueOf())) return d!
  return x.toLocaleDateString()
}

export function objectStatus(o: Objekt): { variant: "default" | "secondary" | "destructive" | "outline", text: string } {
  const today = new Date()

  const from = o.startdate ? new Date(o.startdate) : null
  const to = o.enddate ? new Date(o.enddate) : null

  let status: "Active" | "Passive" | "—" = "—"

  if (!from && !to) {
    status = "—"
  } else if (from && !to) {
    status = "Active"
  } else if (!from && to) {
    status = today <= to ? "Active" : "Passive"
  } else {
    status = from! <= today && today <= to! ? "Active" : "Passive"
  }

  const variant =
    status === "Active"
      ? "default"
      : status === "Passive"
      ? "secondary"
      : "outline"

  return { variant, text: status }
}
