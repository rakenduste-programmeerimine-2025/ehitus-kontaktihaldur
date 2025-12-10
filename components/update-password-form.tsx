"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useRef } from "react"
import { toast } from "sonner"

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const confirmRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      confirmRef.current?.setCustomValidity("Passwords do not match")
      confirmRef.current?.reportValidity()
      return
    } else {
      confirmRef.current?.setCustomValidity("")
    }

    setIsLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Password updated successfully!")
      setPassword("")
      setConfirmPassword("")
    }

    setIsLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid gap-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter a new password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Repeat the new password"
          required
          ref={confirmRef}
          value={confirmPassword}
          onChange={e => {
            setConfirmPassword(e.target.value)
            confirmRef.current?.setCustomValidity("") // ← FIX
          }}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Saving..." : "Save new password"}
      </Button>
    </form>
  )
}
