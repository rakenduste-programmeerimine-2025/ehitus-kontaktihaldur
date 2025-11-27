
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
}