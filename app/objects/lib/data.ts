import { createClient } from "@/lib/supabase/server"
import type { Objekt, RawSearchParams } from "../types"

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
      `name.ilike.%${q}%,location.ilike.%${q}%,description.ilike.%${q}%`,
    )
  }

  if (period_from) {
    query = query.or(`enddate.is.null,enddate.gte.${period_from}`)
  }

  if (period_to) {
    query = query.or(`startdate.is.null,startdate.lte.${period_to}`)
  }

  if (fStatus) {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, "0")
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate(),
    )}`

    if (fStatus === "active") {
      query = query.or(`startdate.is.null,startdate.lte.${today}`)
      query = query.or(`enddate.is.null,enddate.gte.${today}`)
    } else if (fStatus === "passive") {
      query = query.or(`startdate.gt.${today},enddate.lt.${today}`)
    } else if (fStatus === "unknown") {
      query = query.is("startdate", null).is("enddate", null)
    }
  }

  query = query.order(sort, { ascending: dir === "asc", nullsFirst: true })

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}
