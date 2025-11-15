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
  const today = new Date()

  const from = c.workingfrom ? new Date(c.workingfrom) : null
  const to = c.workingto ? new Date(c.workingto) : null

  if (!from && !to) return "—"

  if (from && !to) {
    return "Active"
  }

  if (!from && to) {
    return today <= to ? "Active" : "Passive"
  }

  return from! <= today && today <= to! ? "Active" : "Passive"
}
