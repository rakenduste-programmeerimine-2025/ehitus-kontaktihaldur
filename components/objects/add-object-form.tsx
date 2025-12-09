"use client"

import { createObject, type ObjectFormState } from "@/app/objects/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { useTeam } from "@/components/team-context"
import Link from "next/link"

export default function AddObjectForm() {
  const { activeTeam } = useTeam()
  const teamId = activeTeam?.id ?? null

  const initialState: ObjectFormState = { success: false, message: "" }
  const [state, formAction] = useActionState(createObject, initialState)

  useEffect(() => {
    if (!state.message) return

    if (state.success) toast.success(state.message)
    else toast.error("Error adding object", { description: state.message })
  }, [state])

  const todayISO = new Date().toISOString().split("T")[0]
  const nextMonthISO = (() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    return d.toISOString().split("T")[0]
  })()

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="team_id" value={teamId ?? ""} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Name */}
        <div>
          <Label>Name *</Label>
          <Input name="name" required />
        </div>
        {/* Address */}
        <div>
          <Label>Address</Label>
          <Input name="location" />
        </div>
        {/* Start Date – defaults to today */}
        <div>
          <Label>Start Date</Label>
          <Input name="startdate" type="date" defaultValue={todayISO} />
        </div>
        {/* End Date – defaults to +1 month */}
        <div>
          <Label>End Date</Label>
          <Input name="enddate" type="date" defaultValue={nextMonthISO} />
        </div>
        {/* isactive checkbox – checked = active */}
        <div className="flex gap-2 items-center md:col-span-2">
          <input id="isactive" name="isactive" type="checkbox" defaultChecked />
          <Label htmlFor="isactive">Active</Label>
        </div>
        {/* Description */}
        <div className="md:col-span-2">
          <Label>Description</Label>
          <textarea
            name="description"
            rows={4}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button asChild variant="outline">
          <Link href="/objects">Cancel</Link>
        </Button>
        <Button type="submit">Create Object</Button>
      </div>
    </form>
  )
}