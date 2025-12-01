"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

export function ContactsAlerts() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const deleted = searchParams.get("deleted")
    const name = searchParams.get("name")

    if (deleted === "1") {
      if (name) {
        toast.success(`Contact "${name}" deleted successfully`)
      } else {
        toast.success("Contact deleted successfully")
      }

      const params = new URLSearchParams(searchParams.toString())
      params.delete("deleted")
      params.delete("name")

      const qs = params.toString()
      router.replace(qs ? `/contacts?${qs}` : "/contacts")
    }
  }, [searchParams, router])

  return null
}
