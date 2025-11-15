import type { Objekt } from "./types"

export function fmt(d?: string | null) {
  if (!d) return "—"
  const x = new Date(d)
  if (Number.isNaN(x.valueOf())) return d!
  return x.toLocaleDateString()
}

export function objectStatus(o: Objekt) {
  const today = new Date()

  const from = o.startdate ? new Date(o.startdate) : null
  const to = o.enddate ? new Date(o.enddate) : null

  if (!from && !to) return "—"

  if (from && !to) {
    return "Active"
  }

  if (!from && to) {
    return today <= to ? "Active" : "Passive"
  }

  return from! <= today && today <= to! ? "Active" : "Passive"
}
