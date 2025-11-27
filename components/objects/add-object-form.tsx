
"use client"

import { createObject, type ObjectFormState } from "@/app/objects/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"

const initialState: ObjectFormState = {
  success: false,
  message: "",
}

// YYYY-MM-DD 
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

// Today and +1 month
const today = new Date()
const oneMonthLater = new Date()
oneMonthLater.setMonth(oneMonthLater.getMonth() + 1)

const defaultStartDate = formatDate(today)
const defaultEndDate = formatDate(oneMonthLater)

export default function AddObjectForm() {
  const [state, formAction] = useActionState(createObject, initialState)

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message)
      } else {
        toast.error("Error adding object", {
          description: state.message,
        })
      }
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Name */}
        <div className="space-y-1">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required placeholder="Object name" />
        </div>

        {/* Address */}
        <div className="space-y-1">
          <Label htmlFor="location">Address</Label>
          <Input id="location" name="location" placeholder="Full address" />
        </div>

        {/* Start Date – defaults to today */}
        <div className="space-y-1">
          <Label htmlFor="startdate">Start Date</Label>
          <Input
            id="startdate"
            name="startdate"
            type="date"
            defaultValue={defaultStartDate}
          />
        </div>

        {/* End Date – defaults to +1 month */}
        <div className="space-y-1">
          <Label htmlFor="enddate">End Date</Label>
          <Input
            id="enddate"
            name="enddate"
            type="date"
            defaultValue={defaultEndDate}
          />
        </div>

        {/* isactive checkbox – checked = active */}
        <div className="flex items-center space-x-2 md:col-span-2">
          <input
            id="isactive"
            name="isactive"
            type="checkbox"
            defaultChecked={true} 
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="isactive" className="cursor-pointer font-normal">
            Active
          </Label>
        </div>

        {/* Description */}
        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            placeholder="Detailed description..."
            className="min-h-32 resize-none"

            rows={5}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" asChild>
          <a href="/objects">Cancel</a>
        </Button>
        <Button type="submit">Create Object</Button>
      </div>
    </form>
  )
}