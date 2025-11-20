// app/objects/add/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ObjectAddPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: hasError } = await searchParams;

  const supabase = await createClient();

  // ───── Auth check ─────
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/auth/login");

  // ───── Server Action – create new object ─────
  async function createObject(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const newObject = {
      name: formData.get("name") as string | null,
      location: formData.get("location") as string | null,
      description: formData.get("description") as string | null,
      startdate: formData.get("startdate") as string | null,
      enddate: formData.get("enddate") as string | null,
      inactive: formData.get("inactive") === "on",
    };

    const { data, error } = await supabase
      .from("object")
      .insert(newObject)
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      redirect("/objects/add?error=1");
    } else {
      // `data` will contain the newly created row (including its id)
      redirect(`/objects/${data.id}`);
    }
  }

  // ───── UI ─────
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add New Object</h1>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/objects">Cancel</Link>
          </Button>

          <Button type="submit" form="add-form">
            Create Object
          </Button>
        </div>
      </div>

      {hasError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to create object. Please try again.
        </div>
      )}

      {/* Form */}
      <form id="add-form" action={createObject} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Object name"
            />
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Address
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Full address"
            />
          </div>

          {/* Start Date */}
          <div>
            <label
              htmlFor="startdate"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Start Date
            </label>
            <input
              id="startdate"
              name="startdate"
              type="date"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* End Date */}
          <div>
            <label
              htmlFor="enddate"
              className="block text-sm font-medium text-foreground mb-1"
            >
              End Date
            </label>
            <input
              id="enddate"
              name="enddate"
              type="date"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* Inactive checkbox */}
          <div className="flex items-center space-x-2 md:col-span-2">
            <input
              id="inactive"
              name="inactive"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="inactive" className="text-sm font-medium">
              Inactive (Passive)
            </label>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Detailed description..."
            />
          </div>
        </div>
      </form>
    </div>
  );
}