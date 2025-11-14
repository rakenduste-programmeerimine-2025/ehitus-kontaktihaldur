"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
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
