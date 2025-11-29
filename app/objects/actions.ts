// app/objects/actions.ts
"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export type ObjectFormState = {
  success: boolean
  message: string
}

export async function createObject(
  prevState: ObjectFormState,
  formData: FormData
): Promise<ObjectFormState> {
  const supabase = await createClient()

  const newObject = {
    name: formData.get("name") as string,
    location: formData.get("location") as string | null,
    description: formData.get("description") as string | null,
    startdate: formData.get("startdate") as string | null,
    enddate: formData.get("enddate") as string | null,
    isactive: formData.get("isactive") === "on",
  }

  const { data, error } = await supabase
    .from("object")
    .insert(newObject)
    .select()
    .single()

  if (error) {
    return { success: false, message: error.message }
  }

  redirect(`/objects/${data.id}`)
}

export async function deleteObject(
  _: ObjectFormState,
  formData: FormData
): Promise<ObjectFormState> {
  "use server"

  const supabase = await createClient()
  const id = Number(formData.get("id"))

  if (isNaN(id)) return { success: false, message: "Invalid ID" }

  const { error } = await supabase.from("object").delete().eq("id", id)
  if (error) return { success: false, message: error.message }

  redirect("/objects") 
}

export async function updateObject(
  _: ObjectFormState,
  formData: FormData
): Promise<ObjectFormState> {
  const supabase = await createClient()
  const id = Number(formData.get("id"))

  if (isNaN(id)) {
    return { success: false, message: "Invalid ID" }
  }

  const updates = {
    name: formData.get("name") as string,
    location: formData.get("location") as string | null,
    description: formData.get("description") as string | null,
    startdate: formData.get("startdate") as string | null,
    enddate: formData.get("enddate") as string | null,
    isactive: formData.get("isactive") === "on",
  }

 
  const { error } = await supabase.from("object").update(updates).eq("id", id)

  if (error) {
    return { success: false, message: error.message }
  }

  redirect(`/objects/${id}`)
}


export async function addWorkerToObject(
  _: ObjectFormState,
  formData: FormData
): Promise<ObjectFormState> {
  "use server"

  const supabase = await createClient()
  const objectId = Number(formData.get("objectId"))
  const contactId = Number(formData.get("contactId"))

  if (isNaN(objectId) || isNaN(contactId)) {
    return { success: false, message: "Invalid data" }
  }

  // Just insert — if it already exists, Supabase will return error 23505 → we ignore it
  const { error } = await supabase
    .from("workingon")
    .insert({
      fk_object_id: objectId,
      fk_contact_id: contactId,
      ispaid: false,
    })

  // 23505 = unique violation → means worker is already assigned → totally fine
  if (error && error.code !== "23505") {
    return { success: false, message: error.message }
  }

  return { success: true, message: "Worker added" }
}

export async function removeWorkerFromObject(
  _: ObjectFormState,
  formData: FormData
): Promise<ObjectFormState> {
  "use server"

  const supabase = await createClient()
  const objectId = Number(formData.get("objectId"))
  const contactId = Number(formData.get("contactId"))

  if (isNaN(objectId) || isNaN(contactId)) {
    return { success: false, message: "Invalid data" }
  }


  const { error } = await supabase
    .from("workingon")
    .delete()
    .eq("fk_object_id", objectId)
    .eq("fk_contact_id", contactId)

  if (error) {
    console.error("Remove worker error:", error)
    return { success: false, message: error.message || "Failed to remove" }
  }

  return { success: true, message: "Worker removed" }
}