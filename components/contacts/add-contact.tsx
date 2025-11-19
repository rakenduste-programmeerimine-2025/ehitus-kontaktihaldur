import { createContact } from "@/app/contacts/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type Obj = { id: number; name: string }

export default function AddContactForm({ objects }: { objects: Obj[] }) {
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
          placeholder="Electrician, Welder"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="objects">Object(s)</Label>
        <select
          id="objects"
          name="objects"
          multiple
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          {objects.map((o: Obj) => (
            <option
              key={o.id}
              value={o.id}
            >
              {o.name}
            </option>
          ))}
        </select>
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
