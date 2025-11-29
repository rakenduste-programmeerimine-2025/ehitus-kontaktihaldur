// components/objects/WorkersManager.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Save } from "lucide-react"
import { toast } from "sonner"
import { updateWorkersAction } from "@/app/objects/actions"

type Contact = { id: number; name: string }

type Props = {
  objectId: number
  allContacts: Contact[]
  currentContactIds: Set<number>
}

export default function WorkersManager({ objectId, allContacts, currentContactIds }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(currentContactIds))
  const [isSaving, setIsSaving] = useState(false)

  const hasChanges = ![...selectedIds].every(id => currentContactIds.has(id)) ||
                     ![...currentContactIds].every(id => selectedIds.has(id))

  const toggle = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const save = async () => {
    setIsSaving(true)
    const formData = new FormData()
    formData.append("objectId", objectId.toString())
    formData.append("contactIds", Array.from(selectedIds).join(","))

    const res = await updateWorkersAction({ success: false, message: "" }, formData)
    
    setIsSaving(false)
    if (res.success) {
      toast.success("Workers updated successfully")
    } else {
      toast.error("Failed to update workers", { description: res.message })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Assign Workers
          </span>
          <Button 
            onClick={save} 
            disabled={!hasChanges || isSaving}
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {allContacts.map(contact => (
          <div
            key={contact.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedIds.has(contact.id)}
                onCheckedChange={() => toggle(contact.id)}
              />
              <Label className="flex items-center gap-3 cursor-pointer font-medium">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                {contact.name}
              </Label>
            </div>
            {selectedIds.has(contact.id) && (
              <span className="text-emerald-600 text-sm font-medium">Will be assigned</span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}