
"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// ────────────────────────────────
// Object Form State
// ────────────────────────────────
export type ObjectFormState = {
  success: boolean
  message: string
}

// ────────────────────────────────
// 1. Create Object
// ────────────────────────────────
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

// ────────────────────────────────
// 2. Update Workers 
// ────────────────────────────────
export async function updateWorkersAction(
  prevState: ObjectFormState,
  formData: FormData
): Promise<ObjectFormState> {
  const supabase = await createClient()

  const objectId = Number(formData.get("objectId"))
  const contactIds = (formData.get("contactIds") as string)
    .split(",")
    .map(Number)
    .filter(n => !isNaN(n))

  if (isNaN(objectId)) {
    return { success: false, message: "Invalid object ID" }
  }

  // Step 1: Delete all existing assignments
  const { error: deleteError } = await supabase
    .from("workingon")
    .delete()
    .eq("fk_object_id", objectId)

  if (deleteError) {
    console.error("Failed to delete old workers:", deleteError)
    return { success: false, message: deleteError.message }
  }

  // Step 2: Insert new ones
  if (contactIds.length > 0) {
    const inserts = contactIds.map(contactId => ({
      fk_object_id: objectId,
      fk_contact_id: contactId,
      ispaid: false, // default
    }))

    const { error: insertError } = await supabase
      .from("workingon")
      .insert(inserts)

    if (insertError) {
      console.error("Failed to insert workers:", insertError)
      return { success: false, message: insertError.message }
    }
  }

  revalidatePath(`/objects/${objectId}`)
  return { success: true, message: "Workers updated successfully" }
}

// ────────────────────────────────
// 3. Task Actions 
// ────────────────────────────────
export async function addTask(objectId: number, formData: FormData) {
  const supabase = await createClient()
  const title = formData.get("title")?.toString().trim()
  const repeat_type = (formData.get("repeat_type") as string) || "none"

  if (!title) return

  const taskData: any = {
    object_id: objectId,
    title,
    repeat_type,
    is_done: false,
  }

  if (repeat_type !== "none") {
    taskData.next_due_date = new Date()
  }

  await supabase.from("tasks").insert(taskData)
  revalidatePath(`/objects/${objectId}`)
}

export async function toggleTaskDone(taskId: string, currentDone: boolean, task: any) {
  const supabase = await createClient()

  const updates: any = {
    last_completed_at: new Date(),
  }

  if (currentDone) {
    updates.is_done = false

    const now = new Date()
    let nextDue: Date | null = null

    switch (task.repeat_type) {
      case "daily":
        nextDue = new Date(now.setDate(now.getDate() + (task.repeat_interval || 1)))
        break
      case "weekly":
        nextDue = new Date(now.setDate(now.getDate() + 7 * (task.repeat_interval || 1)))
        break
      case "monthly":
        nextDue = new Date(now.setFullYear(now.getFullYear(), now.getMonth() + (task.repeat_interval || 1), now.getDate()))
        break
      case "yearly":
        nextDue = new Date(now.setFullYear(now.getFullYear() + (task.repeat_interval || 1)))
        break
    }

    if (nextDue) updates.next_due_date = nextDue
  } else {
    updates.is_done = true
  }

  await supabase.from("tasks").update(updates).eq("id", taskId)
  revalidatePath(`/objects/[id]`, "page")
}

// ────────────────────────────────
//  delete object
// ────────────────────────────────

export async function deleteObject(objectId: number): Promise<ObjectFormState> {
  "use server"

  const supabase = await createClient()

  const { error } = await supabase
    .from("object")
    .delete()
    .eq("id", objectId)

  if (error) {
    console.error("Delete object error:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/objects")
  redirect("/objects")
}

// ────────────────────────────────
//  Update Object 
// ────────────────────────────────
export async function updateObject(
  prevState: ObjectFormState,
  formData: FormData
): Promise<ObjectFormState> {
  "use server"

  const supabase = await createClient()

  const id = Number(formData.get("id"))
  if (isNaN(id)) {
    return { success: false, message: "Invalid object ID" }
  }

  const updatedObject = {
    name: formData.get("name") as string,
    location: (formData.get("location") as string) || null,
    description: (formData.get("description") as string) || null,
    startdate: (formData.get("startdate") as string) || null,
    enddate: (formData.get("enddate") as string) || null,
    isactive: formData.get("isactive") === "on",
  }

  const { error } = await supabase
    .from("object")
    .update(updatedObject)
    .eq("id", id)

  if (error) {
    console.error("Update object error:", error)
    return { success: false, message: error.message }
  }

  revalidatePath(`/objects/${id}`)
  revalidatePath("/objects") // optional – refreshes the list page too
  return { success: true, message: "Object updated successfully" }
}