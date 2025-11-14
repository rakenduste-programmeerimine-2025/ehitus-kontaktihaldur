"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export function AvatarUpload({
  currentAvatar,
  userId,
  firstName,
  lastName,
}: {
  currentAvatar: string | null
  userId: string
  firstName?: string
  lastName?: string
}) {
  const supabase = createClient()

  const UI_AVATAR_PREFIX = "https://ui-avatars.com/api/"

  const initials =
    (firstName?.[0]?.toUpperCase() ?? "") + (lastName?.[0]?.toUpperCase() ?? "")

  const defaultAvatarUrl = `${UI_AVATAR_PREFIX}?name=${initials}`

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentAvatar || defaultAvatarUrl,
  )

  const isRealAvatar =
    previewUrl !== null && !previewUrl.startsWith(UI_AVATAR_PREFIX)

  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const ext = file.name.split(".").pop()
      const filePath = `avatars/${userId}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })
      if (uploadErr) throw uploadErr

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
      const url = data.publicUrl

      const { error: updateErr } = await supabase.auth.updateUser({
        data: { avatar_url: url },
      })
      if (updateErr) throw updateErr

      setPreviewUrl(url)
      toast.success("Profile picture updated!")
    } catch {
      toast.error("Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!confirm("Remove your profile picture?")) return

    try {
      await supabase.auth.updateUser({
        data: { avatar_url: null },
      })

      const newDefault = `${UI_AVATAR_PREFIX}?name=${initials}`
      setPreviewUrl(newDefault)

      toast.success("Avatar removed!")
      window.location.reload()
    } catch {
      toast.error("Failed to remove avatar")
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Avatar className="h-28 w-28">
        <AvatarImage
          key={previewUrl}
          src={previewUrl ?? undefined}
          alt="avatar"
          className="w-full h-full object-cover"
        />
        <AvatarFallback className="text-3xl font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex gap-2">
        <Button
          asChild
          disabled={isUploading}
        >
          <label>
            {isUploading ? "Uploading..." : "Change picture"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </Button>

        {isRealAvatar && (
          <Button
            variant="destructive"
            onClick={handleRemoveAvatar}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}
