export type Contact = {
  id: number
  created_at: string | null
  name: string
  roles: string | null
  objects: string | null
  email: string | null
  number: string | null
  birthday: string | null
  cost: number | null
  workingfrom: string | null
  workingto: string | null
  isfavorite: boolean
  isblacklist: boolean
}

export type ObjectHistoryRow = {
  workingon_id: number
  contact_id: number
  from_date: string | null
  to_date: string | null
  object_id: number | null
  object_name: string | null
  rating: number | null
  reviewtext: string | null
}

export type RawSearchParams = {
  q?: string
  sort?: "name" | "created_at" | "workingfrom" | "workingto" | "roles" | "objects"
  dir?: "asc" | "desc"
  status?: "active" | "passive"
  r?: string
  o?: string
  wf_from?: string
  wt_to?: string
  fav?: "1"
  bl?: "1"
  team?: string | null
}

export type SearchParamsPromise = Promise<RawSearchParams>
