"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { toBool } from "./utils"

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

export async function createContact(formData: FormData) {
  const sb = await createClient()

  const name = formData.get("name")?.toString().trim()
  if (!name) return

  const number = formData.get("number")?.toString().trim() || null
  const email = formData.get("email")?.toString().trim() || null
  const birthday = formData.get("birthday")?.toString().trim() || null
  const roles = formData.get("roles")?.toString().trim() || null
  const objects = formData.get("objects")?.toString().trim() || null
  const workingfrom = formData.get("workingfrom")?.toString().trim() || null
  const workingto = formData.get("workingto")?.toString().trim() || null

  const costStr = formData.get("cost")?.toString().trim()
  const cost = costStr ? Number(costStr) : null

  const { error } = await sb.from("contacts").insert({
    name,
    number,
    email,
    birthday,
    roles,
    objects,
    workingfrom,
    workingto,
    cost,
    isfavorite: false,
    isblacklist: false,
  })

  if (error) throw error

  revalidatePath("/contacts")
  redirect("/contacts")
}

