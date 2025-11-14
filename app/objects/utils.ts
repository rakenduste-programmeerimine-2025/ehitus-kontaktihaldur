import type { Objekt } from "./types"

export function fmt(d?: string | null) {
  if (!d) return "—"
  const x = new Date(d)
  if (Number.isNaN(x.valueOf())) return d!
  return x.toLocaleDateString()
}

export function objectStatus(obj: Objekt) {
  if (!obj.startdate && !obj.enddate) return "Unknown"
  const today = new Date()
  const fromOk = obj.startdate ? new Date(obj.startdate) <= today : true
  const toOk = obj.enddate ? today <= new Date(obj.enddate) : true
  return fromOk && toOk ? "Active" : "Passive"
}
