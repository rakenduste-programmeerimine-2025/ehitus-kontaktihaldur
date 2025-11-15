import { createClient } from "@/lib/supabase/server"
import type { Objekt, RawSearchParams } from "./types"
import { objectStatus } from "./utils"

export async function getObjects(sp: RawSearchParams): Promise<Objekt[]> {
  const supabase = await createClient()

  const q = (sp?.q ?? "").trim()
  const sort = sp?.sort ?? "name"
  const dir = sp?.dir === "desc" ? "desc" : "asc"

  const fStatus = sp?.status
  const period_from = sp?.period_from?.trim() ?? ""
  const period_to = sp?.period_to?.trim() ?? ""

  let query = supabase.from("object").select("*")

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,location.ilike.%${q}%,description.ilike.%${q}%`
    )
  }

  if (period_from) {
    query = query.or(`enddate.is.null,enddate.gte.${period_from}`)
  }

  if (period_to) {
    query = query.or(`startdate.is.null,startdate.lte.${period_to}`)
  }

  const { data, error } = await query.order(sort, {
    ascending: dir === "asc",
    nullsFirst: true,
  })

  if (error) throw error

  let rows = (data ?? []) as Objekt[]

  if (fStatus === "active" || fStatus === "passive") {
    rows = rows.filter(o => !(o.startdate == null && o.enddate == null))

    const wanted = fStatus === "active" ? "Active" : "Passive"
    rows = rows.filter(o => objectStatus(o) === wanted)
  }

  return rows
}
