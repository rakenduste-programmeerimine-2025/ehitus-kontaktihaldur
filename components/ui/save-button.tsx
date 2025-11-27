"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

export function SaveButton({ formId }: { formId: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button">Save Changes</Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save changes?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to save these changes?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={() => {
              const form = document.getElementById(
                formId,
              ) as HTMLFormElement | null
              form?.requestSubmit()
            }}
          >
            Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
