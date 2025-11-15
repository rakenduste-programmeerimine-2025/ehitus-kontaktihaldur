export type Objekt = {
  id: number
  created_at: string | null
  name: string | null
  location: string | null
  description: string | null
  startdate: string | null
  enddate: string | null
  inactive: boolean | null
  user_id: string | null
}

export type RawSearchParams = {
  q?: string
  sort?: "name" | "location" | "startdate" | "enddate" | "created_at"
  dir?: "asc" | "desc"
  status?: "active" | "passive"
  period_from?: string
  period_to?: string
}

export type SearchParamsPromise = Promise<RawSearchParams>
