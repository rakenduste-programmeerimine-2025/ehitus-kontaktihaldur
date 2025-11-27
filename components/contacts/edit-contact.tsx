"use client"

import { useActionState, useEffect } from "react"
import { updateContact } from "@/app/contacts/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { Contact, ObjectHistoryRow } from "@/app/contacts/types"

import { CancelButton } from "@/components/ui/cancel-button"
import { SaveButton } from "@/components/ui/save-button"

type Props = {
  contact: Contact
  history: ObjectHistoryRow[]
  objects: { id: number; name: string }[]
}

export default function EditContact({ contact, history, objects }: Props) {
  const [state, formAction] = useActionState(updateContact, {
    success: false,
    message: "",
    id: null,
  })

  const router = useRouter()

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message)
        router.push(`/contacts/${state.id}`)
      } else {
        toast.error("Error updating contact", {
          description: state.message,
        })
      }
    }
  }, [state, router])

  return (
    <form
      id="edit-contact-form"
      action={formAction}
      className="max-w-4xl mx-auto rounded-xl border bg-white p-8 shadow-sm space-y-10"
    >
      <input
        type="hidden"
        name="id"
        value={contact.id}
      />

      <div>
        <h1 className="text-2xl font-semibold">{contact.name}</h1>
        <div className="text-muted-foreground">{contact.roles ?? "Role"}</div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Contact Data</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label>Full Name</Label>
            <Input
              name="name"
              defaultValue={contact.name}
            />
          </div>

          <div className="space-y-1">
            <Label>Email Address</Label>
            <Input
              name="email"
              defaultValue={contact.email ?? ""}
            />
          </div>

          <div className="space-y-1">
            <Label>Phone Number</Label>
            <Input
              name="number"
              defaultValue={contact.number ?? ""}
            />
          </div>

          <div className="space-y-1">
            <Label>Birthdate</Label>
            <Input
              type="date"
              name="birthday"
              defaultValue={contact.birthday ?? ""}
            />
          </div>

          <div className="space-y-1">
            <Label>Role(s)</Label>
            <Input
              name="roles"
              defaultValue={contact.roles ?? ""}
            />
          </div>

          <div className="space-y-1">
            <Label>Working period</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                name="workingfrom"
                defaultValue={contact.workingfrom ?? ""}
              />
              <Input
                type="date"
                name="workingto"
                defaultValue={contact.workingto ?? ""}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Blacklist</Label>
            <input
              type="checkbox"
              name="isblacklist"
              defaultChecked={contact.isblacklist}
            />
          </div>

          <div className="space-y-1">
            <Label>Cost</Label>
            <Input
              type="number"
              step="0.01"
              name="cost"
              defaultValue={contact.cost ?? ""}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Object History</h2>

        <div className="space-y-6">
          {history.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-3 gap-4 border rounded-md p-4"
            >
              <input
                type="hidden"
                name={`history_workingon_id_${i}`}
                value={row.workingon_id}
              />

              <div className="space-y-1">
                <Label>Object</Label>
                <select
                  name={`history_object_${i}`}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  defaultValue={row.object_id?.toString() ?? ""}
                >
                  {objects.map(obj => (
                    <option
                      key={obj.id}
                      value={obj.id}
                    >
                      {obj.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label>Rating</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  name={`history_rating_${i}`}
                  defaultValue={row.rating ?? ""}
                />
              </div>

              <div className="space-y-1">
                <Label>Review</Label>
                <Input
                  name={`history_review_${i}`}
                  defaultValue={row.reviewtext ?? ""}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <CancelButton />
        <SaveButton formId="edit-contact-form" />
      </div>
    </form>
  )
}
