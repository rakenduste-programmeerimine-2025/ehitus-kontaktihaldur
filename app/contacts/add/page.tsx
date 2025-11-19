import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createContact } from "@/app/contacts/actions"

export default async function AddContactPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Add Contact</h1>

      <form
        action={createContact}
        className="space-y-4 rounded-xl border bg-background p-6 shadow-sm"
      >
        <div className="space-y-1">
          <label
            htmlFor="name"
            className="text-sm font-medium"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="number"
            className="text-sm font-medium"
          >
            Phone Number
          </label>
          <input
            id="number"
            name="number"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="email"
            className="text-sm font-medium"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="birthday"
            className="text-sm font-medium"
          >
            Birthdate
          </label>
          <input
            id="birthday"
            name="birthday"
            type="date"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="roles"
            className="text-sm font-medium"
          >
            Role(s)
          </label>
          <input
            id="roles"
            name="roles"
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="e.g. Electrician"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="objects"
            className="text-sm font-medium"
          >
            Object(s)
          </label>
          <input
            id="objects"
            name="objects"
            className="w-full rounded-md border px-3 py-2 text-sm"
            placeholder="e.g. Pilve 6"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Working Period</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              id="workingfrom"
              name="workingfrom"
              type="date"
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Start Date"
            />
            <input
              id="workingto"
              name="workingto"
              type="date"
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="End Date"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="cost"
            className="text-sm font-medium"
          >
            Cost
          </label>
          <input
            id="cost"
            name="cost"
            type="number"
            step="0.01"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Add Contact
        </button>
      </form>
    </div>
  )
}
