"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { toBool } from "./utils"

export type ContactFormState = {
  success: boolean
  message: string
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
  if (!id) return
  const { error } = await sb.from("contacts").delete().eq("id", id)
  if (error) throw error
  revalidatePath("/contacts")
  redirect("/contacts")
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

  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect("/auth/login")

  const userId = user.id

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
    p_user_id: userId
  })

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath("/contacts")
  return { success: true, message: `Contact ${name} added successfully!` }
}
