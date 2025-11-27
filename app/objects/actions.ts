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
    console.error("Insert error:", error)
    return { success: false, message: error.message }
  }

  redirect(`/objects/${data.id}`)
<<<<<<< HEAD
}

// app/objects/actions.ts  ← add this function below createObject

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

  const { error } = await supabase
    .from("object")
    .update(updates)
    .eq("id", id)

  if (error) {
    return { success: false, message: error.message }
  }

  redirect(`/objects/${id}`)
=======
>>>>>>> defe3e79d0d3e09376507a92ae85de8d61d12c37
}