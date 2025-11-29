"use client"

import { addWorkerToObject, removeWorkerFromObject, type ObjectFormState } from "@/app/objects/actions"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"
import { useOptimistic, startTransition } from "react"
import { toast } from "sonner"

type Contact = { id: number; name: string }

type Props = {
  objectId: number
  allContacts: Contact[]
  currentContactIds: Set<number>
}

export default function WorkersManager({ objectId, allContacts, currentContactIds }: Props) {
  const [optimisticIds, addOptimistic] = useOptimistic(
    currentContactIds,
    (state: Set<number>, contactId: number) => {
      const next = new Set(state)
      next.has(contactId) ? next.delete(contactId) : next.add(contactId)
      return next
    }
  )

  const toggle = async (contactId: number, shouldBeChecked: boolean) => {
    startTransition(() => {
      addOptimistic(contactId)

      const action = shouldBeChecked ? addWorkerToObject : removeWorkerFromObject
      const formData = new FormData()
      formData.append("objectId", objectId.toString())
      formData.append("contactId", contactId.toString())

      action({ success: false, message: "" }, formData).then(res => {
        if (!res.success) {
          toast.error(res.message || "Failed")
          addOptimistic(contactId) // revert
        } else {
          toast.success(shouldBeChecked ? "Added" : "Removed")
        }
      })
    })
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-3">
        {allContacts.map(c => {
          const checked = optimisticIds.has(c.id)
          return (
            <div
              key={c.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5"
            >
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={checked}
                  onCheckedChange={v => toggle(c.id, !!v)}
                />
                <Label className="flex items-center gap-3 cursor-pointer font-medium">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  {c.name}
                </Label>
              </div>
              {checked && <span className="text-emerald-600 text-sm font-medium">Working here</span>}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}