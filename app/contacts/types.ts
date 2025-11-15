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
}

export type SearchParamsPromise = Promise<RawSearchParams>
