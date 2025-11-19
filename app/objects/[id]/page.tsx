// kasutatud veidi aid
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fmt, objectStatus } from "@/app/objects/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, DollarSign } from "lucide-react";

export default async function ObjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNum = Number(id);
  if (isNaN(idNum) || idNum <= 0) notFound();

  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/auth/login");

  // 1. peamine objekti GET
  const { data: object, error: objectError } = await supabase
    .from("object")
    .select("*")
    .eq("id", idNum)
    .single();

  if (objectError || !object) {
    console.error("Object not found:", objectError);
    notFound();
  }

  // kasutab vaadet kontaktide leidmiseks
  const { data: workers, error: workersError } = await supabase
    .from("object_with_workers")
    .select("contact, contactid, ispaid")
    .eq("id", idNum)                
    .order("contact", { ascending: true });

  if (workersError) {
    console.error("Error loading workers:", workersError);

  }

  const status = objectStatus(object);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Header */}
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
            <p className="mt-1">{fmt(object.startdate)} – {fmt(object.enddate)}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">Status</h2>
            <div className="mt-1">
              {status === "Active" && <Badge className="bg-emerald-600 text-white">Active</Badge>}
              {status === "Passive" && <Badge variant="secondary">Passive</Badge>}
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

      {/* töötajate kaart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Workers on Site
            <Badge variant="outline" className="ml-auto">
              {workers?.length ?? 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!workers || workers.length === 0) ? (
            <p className="text-muted-foreground italic">
              No workers assigned to this object yet.
            </p>
          ) : (
            <div className="space-y-3">
              {workers.map((worker) => (
                <Link
                  key={worker.contactid}
                  href={`/contacts/${worker.contactid}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 hover:border-accent transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground hover:underline">
                          {worker.contact || "Unnamed contact"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {worker.ispaid !== null && (
                        <Badge variant={worker.ispaid ? "default" : "secondary"}>
                          {worker.ispaid ? (
                            <>
                              <DollarSign className="w-3 h-3 mr-1" />
                              Paid
                            </>
                          ) : (
                            "Unpaid"
                          )}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        → View details
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}