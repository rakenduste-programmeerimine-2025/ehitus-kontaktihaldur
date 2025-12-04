import { createClient } from "@/lib/supabase/server"
import type { Contact, RawSearchParams, ObjectHistoryRow } from "./types"
import { workingStatus } from "./utils"

export async function getContacts(sp: RawSearchParams): Promise<Contact[]> {
  const supabase = await createClient()

const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) return []


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

  if (sp.team) {
    query = query.eq("team_id", sp.team)
  } else {
    query = query.eq("user_id", user.id)
  }

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,roles.ilike.%${q}%,objects.ilike.%${q}%,email.ilike.%${q}%,number.ilike.%${q}%`
    )
  }

  if (fRole) query = query.ilike("roles", `%${fRole}%`)
  if (fObj) query = query.ilike("objects", `%${fObj}%`)
  if (wf_from) query = query.or(`workingto.is.null,workingto.gte.${wf_from}`)
  if (wt_to) query = query.or(`workingfrom.is.null,workingfrom.lte.${wt_to}`)

  if (onlyFav) query = query.eq("isfavorite", true)
  if (onlyBl) query = query.eq("isblacklist", true)

  const { data, error } = await query.order(sort, {
    ascending: dir === "asc",
    nullsFirst: true,
  })

  if (error) throw error

  let rows = (data ?? []) as Contact[]

  if (fStatus === "active" || fStatus === "passive") {
    rows = rows.filter(
      (c) => !(c.workingfrom == null && c.workingto == null)
    )

    const wanted = fStatus === "active" ? "Active" : "Passive"
    rows = rows.filter((c) => workingStatus(c) === wanted)
  }

  return rows
}

export async function getContactWithHistory(id: number): Promise<{
  contact: Contact | null
  history: ObjectHistoryRow[]
}> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("contacts_with_details")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (!data) {
    return { contact: null, history: [] }
  }

  const contact = data as Contact

  const { data: historyData } = await supabase
    .from("contact_object_history")
    .select("*")
    .eq("contact_id", id)
    .order("from_date", { ascending: false })

  const history = (historyData ?? []) as ObjectHistoryRow[]

  return { contact, history }
}
