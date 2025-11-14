import type { Contact } from "./types"

export function toBool(v: FormDataEntryValue | null): boolean | null {
  if (v === null) return null
  const s = v.toString().trim().toLowerCase()
  if (s === "true" || s === "1" || s === "on") return true
  if (s === "false" || s === "0") return false
  return null
}

export function fmt(d?: string | null) {
  if (!d) return "—"
  const x = new Date(d)
  if (Number.isNaN(x.valueOf())) return d!
  return x.toLocaleDateString()
}

export function workingStatus(c: Contact) {
  if (!c.workingfrom && !c.workingto) return "Unknown"
  const today = new Date()
  const fromOk = c.workingfrom ? new Date(c.workingfrom) <= today : true
  const toOk = c.workingto ? today <= new Date(c.workingto) : true
  return fromOk && toOk ? "Active" : "Passive"
}
