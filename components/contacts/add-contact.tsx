import { createContact } from "@/app/contacts/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function AddContactForm() {
  return (
    <form
      action={createContact}
      className="space-y-4 rounded-xl border bg-background p-6 shadow-sm"
    >
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="number">Phone Number</Label>
        <Input
          id="number"
          name="number"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="birthday">Birthdate</Label>
        <Input
          id="birthday"
          name="birthday"
          type="date"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="roles">Role(s)</Label>
        <Input
          id="roles"
          name="roles"
          placeholder="e.g. Electrician"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="objects">Object(s)</Label>
        <Input
          id="objects"
          name="objects"
          placeholder="e.g. Pilve 6"
        />
      </div>

      <div className="space-y-1">
        <Label>Working Period</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            id="workingfrom"
            name="workingfrom"
            type="date"
          />
          <Input
            id="workingto"
            name="workingto"
            type="date"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="cost">Cost</Label>
        <Input
          id="cost"
          name="cost"
          type="number"
          step="0.01"
        />
      </div>

      <Button
        type="submit"
        className="mt-2 w-full"
      >
        Add Contact
      </Button>
    </form>
  )
}
