"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { toBool } from "./utils"

export type ContactFormState = {
  success: boolean
  message: string
  id?: number | null
  contactName?: string | null
}


export async function toggleFavorite(formData: FormData) {
  const sb = await createClient()
  const id = formData.get("id")?.toString()
  const value = !!toBool(formData.get("value"))
  if (!id) return
  const { error } = await sb.from("contacts").update({ isfavorite: value }).eq("id", id)
  if (error) throw error
  revalidatePath("/contacts")
}

export async function toggleBlacklist(formData: FormData) {
  const sb = await createClient()
  const id = formData.get("id")?.toString()
  const value = !!toBool(formData.get("value"))
  if (!id) return
  const { error } = await sb.from("contacts").update({ isblacklist: value }).eq("id", id)
  if (error) throw error
  revalidatePath("/contacts")
}

export async function deleteContact(formData: FormData) {
  const sb = await createClient()
  const id = formData.get("id")?.toString()
  const name = formData.get("name")?.toString() || ""

  if (!id) return

  const { error } = await sb.rpc("delete_full_contact", {
    p_contact_id: Number(id),
  })

  if (error) throw error

  revalidatePath("/contacts")

  const params = new URLSearchParams()
  params.set("deleted", "1")
  if (name) params.set("name", name)

  redirect(`/contacts?${params.toString()}`)
}


export async function createContact(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const sb = await createClient()

  const name = formData.get("name")?.toString().trim()
  if (!name) return { success: false, message: "Name is required." }

  const number = formData.get("number")?.toString().trim() || null
  const email = formData.get("email")?.toString().trim() || null
  const birthday = formData.get("birthday")?.toString().trim() || null
  const rolesStr = formData.get("roles")?.toString().trim() || ""
  const objectsArr = formData.getAll("objects").map(o => Number(o))
  const workingfrom = formData.get("workingfrom")?.toString().trim() || null
  const workingto = formData.get("workingto")?.toString().trim() || null

  const costStr = formData.get("cost")?.toString().trim()
  const cost = costStr ? Number(costStr) : null
  const teamIdRaw = formData.get("team_id")
  const teamId = teamIdRaw ? Number(teamIdRaw) : null

  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect("/auth/login")

  const userId = teamId ? null : user.id

  const { error } = await sb.rpc("create_full_contact", {
    p_name: name,
    p_number: number,
    p_email: email,
    p_birthday: birthday,
    p_roles_str: rolesStr,
    p_objects_arr: objectsArr,
    p_workingfrom: workingfrom,
    p_workingto: workingto,
    p_cost: cost,
    p_user_id: userId,
    p_team_id: teamId
  })

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath("/contacts")
  return { success: true, message: `Contact ${name} added successfully!` }
}

export async function updateContact(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const sb = await createClient()

  const id = Number(formData.get("id"))
  if (!id) return { success: false, message: "Missing contact ID" }

  const name = formData.get("name")?.toString() || null
  const number = formData.get("number")?.toString() || null
  const email = formData.get("email")?.toString() || null
  const birthday = formData.get("birthday")?.toString() || null
  const roles = formData.get("roles")?.toString() || null
  const workingfrom = formData.get("workingfrom")?.toString() || null
  const workingto = formData.get("workingto")?.toString() || null
  const costStr = formData.get("cost")?.toString()
  const cost = costStr ? Number(costStr) : null
  const isblacklist = formData.get("isblacklist") === "on"

  const { data: { user } } = await sb.auth.getUser()
  if (!user) return { success: false, message: "Not logged in." }

  const { data: contactRow } = await sb
    .from("contacts")
    .select("team_id")
    .eq("id", id)
    .single()

  const teamId = contactRow?.team_id ?? null

  const { data: favRow } = await sb
    .from("contacts")
    .select("isfavorite")
    .eq("id", id)
    .single()

  const isfavorite = favRow?.isfavorite ?? false

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const history: any[] = []
  let index = 0

  while (true) {
    const wId = formData.get(`history_workingon_id_${index}`)
    if (!wId) break

    history.push({
      workingon_id: Number(wId),
      object_id: Number(formData.get(`history_object_${index}`)) || null,
      rating: Number(formData.get(`history_rating_${index}`)) || null,
      reviewtext: formData.get(`history_review_${index}`)?.toString() || null
    })

    index++
  }

  const { error } = await sb.rpc("update_full_contact_with_history", {
    p_contact_id: id,
    p_name: name,
    p_number: number,
    p_email: email,
    p_birthday: birthday,
    p_roles_str: roles,
    p_workingfrom: workingfrom,
    p_workingto: workingto,
    p_cost: cost,
    p_isblacklist: isblacklist,
    p_isfavorite: isfavorite,
    p_user_id: user.id,
    p_team_id: teamId,
    p_history: history
  })

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath(`/contacts/${id}`)

  return {
    success: true,
    message: `Contact ${name} updated successfully!`,
    id,
    contactName: name
  }
}