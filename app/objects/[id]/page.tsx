// app/objects/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fmt, objectStatus } from "@/app/objects/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ObjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Convertib string numbriks
  const idNum = Number(id);
  if (isNaN(idNum) || idNum <= 0) notFound();

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  const { data: object, error } = await supabase
    .from("object")
    .select("*")
    .eq("id", idNum)  // ← number
    .single();

  if (error || !object) {
    console.error("Supabase error:", error);
    notFound();
  }

  const status = objectStatus(object);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{object.name ?? "Unnamed Object"}</h1>
          <p className="text-muted-foreground mt-1">
            ID: <code className="bg-muted px-1 rounded text-xs">{object.id}</code>
          </p>
        </div>
            <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
            <Link href={`/objects/${object.id}/edit`}>Edit</Link>
            </Button>

            <Button asChild variant="outline">
            <Link href="/objects">Back to List</Link>
            </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">Address</h2>
            <p className="mt-1">{object.location ?? "—"}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">Period</h2>
            <p className="mt-1">
              {fmt(object.startdate)} – {fmt(object.enddate)}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">Status</h2>
            <div className="mt-1">
              {status === "Active" && (
                <span className="inline-flex items-center rounded bg-emerald-600 text-white px-2 py-0.5 text-xs">
                  Active
                </span>
              )}
              {status === "Passive" && (
                <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs">
                  Passive
                </span>
              )}
              {status === "—" && <span className="text-muted-foreground">—</span>}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">Description</h2>
            <p className="mt-1 whitespace-pre-wrap">{object.description ?? "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}