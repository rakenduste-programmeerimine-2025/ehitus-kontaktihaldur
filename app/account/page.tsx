import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DeleteAccount } from "@/components/account/DeleteAccount"
import { AccountEditDialog } from "@/components/account/AccountEditDialog"
import { AvatarUpload } from "@/components/account/AvatarUpload"

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const firstName = user.user_metadata?.first_name || ""
  const lastName = user.user_metadata?.last_name || ""
  const email = user.email || ""
  const phone = user.user_metadata?.phone || "—"
  const address = user.user_metadata?.address || "—"
  const avatarUrl =
    user.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${
      firstName || lastName ? `${firstName}+${lastName}` : "User"
    }&background=random`

  return (
    <main className="flex flex-col min-h-screen bg-background">
      <section className="max-w-4xl mx-auto w-full px-6 py-16">
        <h1 className="text-3xl font-semibold mb-10">Account</h1>

        <div className="flex flex-col md:flex-row items-start gap-10">
          <div className="flex flex-col items-center md:items-start gap-4 min-w-[220px]">
            <AvatarUpload currentAvatar={avatarUrl} userId={user.id} />

            <div className="text-center md:text-left">
              <p className="text-xl font-medium">
                {firstName} {lastName}
              </p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </div>

          <div className="flex-1 bg-muted/30 rounded-xl border p-8 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">First Name</p>
                <p className="text-base font-medium">{firstName}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Name</p>
                <p className="text-base font-medium">{lastName}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <p className="text-base font-medium">{email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Phone</p>
                <p className="text-base font-medium">{phone}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Address</p>
                <p className="text-base font-medium">{address}</p>
              </div>
            </div>

            <div className="flex justify-end mt-8 gap-3">
              <AccountEditDialog user={user} />
            </div>
          </div>
        </div>

        <div className="mt-16 border-t pt-10">
          <p className="text-sm text-muted-foreground mb-6">
            Deleting your account is permanent and cannot be undone. All your
            data will be lost.
          </p>
          <DeleteAccount />
        </div>
      </section>
    </main>
  )
}
