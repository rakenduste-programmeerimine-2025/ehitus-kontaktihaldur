// app/objects/[id]/edit/page.tsx
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ObjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNum = Number(id);
  if (isNaN(idNum)) notFound();

  const supabase = await createClient();

  // Auth teema
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

    //get object
  const { data: object, error } = await supabase
    .from("object")
    .select("*")
    .eq("id", idNum)
    .single();

  if (error || !object) notFound();

  async function updateObject(formData: FormData) {
    "use server";

    const updates = {
      name: formData.get("name") as string | null,
      location: formData.get("location") as string | null,
      description: formData.get("description") as string | null,
      startdate: formData.get("startdate") as string | null,
      enddate: formData.get("enddate") as string | null,
      inactive: formData.get("inactive") === "on",
    };

    const { error } = await supabase
      .from("objects")
      .update(updates)
      .eq("id", idNum);

    if (error) {
      redirect(`/objects/${id}/edit?error=1`);
    } else {
      redirect(`/objects/${id}`);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Object</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/objects/${id}`}>Cancel</Link>
          </Button>
          <Button type="submit" form="edit-form">
            Save Changes
          </Button>
        </div>
      </div>

      <form id="edit-form" action={updateObject} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Onjekti nimi */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={object.name ?? ""}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Object name"
            />
          </div>

          {/* Objekti Address */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">
              Address
            </label>
            <input
              id="location"
              name="location"
              type="text"
              defaultValue={object.location ?? ""}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Full address"
            />
          </div>

          {/* from date */}
          <div>
            <label htmlFor="startdate" className="block text-sm font-medium text-foreground mb-1">
              Start Date
            </label>
            <input
              id="startdate"
              name="startdate"
              type="date"
              defaultValue={object.startdate ?? ""}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* to Date */}
          <div>
            <label htmlFor="enddate" className="block text-sm font-medium text-foreground mb-1">
              End Date
            </label>
            <input
              id="enddate"
              name="enddate"
              type="date"
              defaultValue={object.enddate ?? ""}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          {/* kas on aktiivne */}
          <div className="flex items-center space-x-2 md:col-span-2">
            <input
              id="inactive"
              name="inactive"
              type="checkbox"
              defaultChecked={object.inactive ?? false}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="inactive" className="text-sm font-medium">
              Inactive (Passive)
            </label>
          </div>

          {/* kirjeldus */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              defaultValue={object.description ?? ""}
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