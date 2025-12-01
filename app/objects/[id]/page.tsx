// app/objects/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fmt, objectStatus } from "@/app/objects/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, DollarSign, CheckCircle2, Circle, Plus } from "lucide-react";
import { revalidatePath } from "next/cache";


async function addTask(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const title = formData.get("title")?.toString().trim();
  const objectId = Number(formData.get("object_id"));

  if (!title || !objectId) return;

  await supabase
    .from("tasks")
    .insert({ object_id: objectId, title, is_done: false });

  revalidatePath(`/objects/${objectId}`);
}


async function toggleTask(taskId: string, currentDone: boolean) {
  "use server";
  const supabase = await createClient();
  await supabase
    .from("tasks")
    .update({ is_done: !currentDone })
    .eq("id", taskId);


  revalidatePath(`/objects/[id]`, "page");
}

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


  const { data: object, error: objectError } = await supabase
    .from("object")
    .select("*")
    .eq("id", idNum)
    .single();

  if (objectError || !object) {
    console.error("Object not found:", objectError);
    notFound();
  }


  const { data: workers } = await supabase
    .from("object_with_workers")
    .select("contact, contactid, ispaid")
    .eq("id", idNum)
    .order("contact", { ascending: true });

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, is_done")
    .eq("object_id", idNum)
    .order("created_at", { ascending: false });

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

      {/* objekti info kaard */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">Address</h2>
            <p className="mt-1">{object.location ?? "—"}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">Period</h2>
            <p className="mt-1">{fmt(object.startdate) ?? "—"} to {fmt(object.enddate) ?? "—"}</p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">Status</h2>
            <Badge variant={status.variant} className="mt-1">{status.text}</Badge>
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">Description</h2>
            <p className="mt-1 whitespace-pre-wrap">{object.description ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* tr;;tajate kard*/}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Workers on Site
              <Badge variant="outline" className="ml-2">{workers?.length ?? 0}</Badge>
            </CardTitle>
            <Button asChild variant="default" size="sm">
              <Link href={`/objects/${object.id}/workers`}>Manage Workers</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(!workers || workers.length === 0) ? (
            <p className="text-muted-foreground italic">No workers assigned to this object yet.</p>
          ) : (
            <div className="space-y-3">
              {workers.map((worker) => (
                <Link key={worker.contactid} href={`/contacts/${worker.contactid}`} className="block">
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 hover:border-accent transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <p className="font-medium hover:underline">{worker.contact || "Unnamed contact"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {worker.ispaid !== null && (
                        <Badge variant={worker.ispaid ? "default" : "secondary"}>
                          {worker.ispaid ? (
                            <>
                              <DollarSign className="w-3 h-3 mr-1" /> Paid
                            </>
                          ) : (
                            "Unpaid"
                          )}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">→ View details</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* === tasklist card === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Tasks & To-Do List
            <Badge variant="outline" className="ml-2">
              {tasks?.length ?? 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* tasklist*/}
          <form action={addTask} className="flex gap-2">
            <input
              type="text"
              name="title"
              placeholder="Add a new task..."
              required
              className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input type="hidden" name="object_id" value={object.id} />
            <Button type="submit" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </form>

          {/* Task List 2 */}
          {(!tasks || tasks.length === 0) ? (
            <p className="text-muted-foreground italic py-8 text-center">
              No tasks yet. Add one above!
            </p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {task.is_done ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`${task.is_done ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </span>
                  </div>

                  <form action={toggleTask.bind(null, task.id, task.is_done)}>
                    <Button
                      type="submit"
                      variant={task.is_done ? "secondary" : "default"}
                      size="sm"
                    >
                      {task.is_done ? "Undo" : "Done"}
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}