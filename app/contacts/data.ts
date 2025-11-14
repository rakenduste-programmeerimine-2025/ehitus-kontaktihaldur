import { createClient } from "@/lib/supabase/server"
import type { Contact, RawSearchParams } from "./types"

export async function getContacts(sp: RawSearchParams): Promise<Contact[]> {
  const supabase = await createClient()

  const q = (sp?.q ?? "").trim()
  const sort = sp?.sort ?? "name"
  const dir = sp?.dir === "desc" ? "desc" : "asc"

  const fRole = sp?.r?.trim() ?? ""
  const fObj = sp?.o?.trim() ?? ""
  const wf_from = sp?.wf_from?.trim() ?? ""
  const wt_to = sp?.wt_to?.trim() ?? ""
  const fStatus = sp?.status
  const onlyFav = sp?.fav === "1"
  const onlyBl = sp?.bl === "1"

  let query = supabase.from("contacts_with_details").select("*")

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,roles.ilike.%${q}%,objects.ilike.%${q}%,email.ilike.%${q}%,number.ilike.%${q}%`,
    )
  }

  if (fRole) query = query.ilike("roles", `%${fRole}%`)
  if (fObj) query = query.ilike("objects", `%${fObj}%`)
  if (wf_from) query = query.or(`workingto.is.null,workingto.gte.${wf_from}`)
  if (wt_to) query = query.or(`workingfrom.is.null,workingfrom.lte.${wt_to}`)

  if (fStatus) {
    const today = new Date().toISOString().split("T")[0]

    if (fStatus === "active") {
      query = query.or(`workingfrom.is.null,workingfrom.lte.${today}`)
      query = query.or(`workingto.is.null,workingto.gte.${today}`)
    } else if (fStatus === "passive") {
      query = query.or(`workingfrom.gt.${today},workingto.lt.${today}`)
    } else if (fStatus === "unknown") {
      query = query.is("workingfrom", null).is("workingto", null)
    }
  }

  if (onlyFav) query = query.eq("isfavorite", true)
  if (onlyBl) query = query.eq("isblacklist", true)

  const { data, error } = await query.order(sort, {
    ascending: dir === "asc",
    nullsFirst: true,
  })

  if (error) throw error
  return data ?? []
}
