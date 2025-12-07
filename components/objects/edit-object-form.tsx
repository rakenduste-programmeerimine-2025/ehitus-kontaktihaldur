"use client"

import { updateObject, type ObjectFormState } from "@/app/objects/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"

const initialState: ObjectFormState = {
  success: false,
  message: "",
}

type Props = {
  object: {
    id: number
    name: string
    location: string | null
    description: string | null
    startdate: string | null
    enddate: string | null
    isactive: boolean
  }
}

export default function EditObjectForm({ object }: Props) {
  const [state, formAction] = useActionState(updateObject, initialState)

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message)
      } else {
        toast.error("Error updating object", {
          description: state.message,
        })
      }
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={object.id} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={object.name}
            placeholder="Object name"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="location">Address</Label>
          <Input
            id="location"
            name="location"
            defaultValue={object.location ?? ""}
            placeholder="Full address"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="startdate">Start Date</Label>
          <Input
            id="startdate"
            name="startdate"
            type="date"
            defaultValue={object.startdate ?? ""}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="enddate">End Date</Label>
          <Input
            id="enddate"
            name="enddate"
            type="date"
            defaultValue={object.enddate ?? ""}
          />
        </div>

        <div className="flex items-center space-x-2 md:col-span-2">
          <input
            id="isactive"
            name="isactive"
            type="checkbox"
            defaultChecked={object.isactive}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="isactive" className="cursor-pointer font-normal">
            Active
          </Label>
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            defaultValue={object.description ?? ""}
            placeholder="Detailed description..."
            className="min-h-32 resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" asChild>
          <a href={`/objects/${object.id}`}>Cancel</a>
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  )
}