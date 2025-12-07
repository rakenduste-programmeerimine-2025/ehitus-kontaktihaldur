"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteObject } from "@/app/objects/actions"

type Props = {
  objectId: number
  objectName: string
}

export default function DeleteObjectButton({ objectId, objectName }: Props) {
  const handleDelete = async () => {
    if (!confirm(`Delete "${objectName}"? This cannot be undone.`)) {
      return
    }

    // Correct way: call the server action directly with just the number
    const result = await deleteObject(objectId)

    if (result.success) {
      toast.success("Object deleted")
      // redirect is already done in the action
    } else {
      toast.error("Failed to delete", { description: result.message })
    }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      <Trash2 className="w-4 h-4 mr-2" />
      Delete Object
    </Button>
  )
}