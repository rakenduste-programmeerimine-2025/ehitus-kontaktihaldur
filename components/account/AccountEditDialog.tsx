"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface AccountEditDialogProps {
  user: User
}

export function AccountEditDialog({ user }: AccountEditDialogProps) {
  const router = useRouter()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [firstName, setFirstName] = useState(
    user.user_metadata?.first_name || "",
  )
  const [lastName, setLastName] = useState(user.user_metadata?.last_name || "")
  const [phone, setPhone] = useState(user.user_metadata?.phone || "")
  const [address, setAddress] = useState(user.user_metadata?.address || "")

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        address: address || null,
      },
    })

    if (!error) {
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button variant="default">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label>First Name</Label>
            <Input
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Phone (optional)</Label>
            <Input
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          <div>
            <Label>Address (optional)</Label>
            <Input
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
