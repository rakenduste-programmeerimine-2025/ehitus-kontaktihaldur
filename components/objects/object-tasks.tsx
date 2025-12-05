// components/objects/ObjectTasks.tsx
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle, Plus, Repeat, Calendar } from "lucide-react"
import { addTask, toggleTaskDone } from "@/actions"
import { formatDistanceToNow } from "date-fns"

type Task = {
  id: string
  title: string
  is_done: boolean
  repeat_type: string
  repeat_interval?: number | null
  next_due_date?: string | null
}

type ObjectTasksProps = {
  objectId: number
  tasks: Task[]
}

export default async function ObjectTasks({ objectId, tasks }: ObjectTasksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Tasks & Recurring To-Dos
          <Badge variant="outline" className="ml-2">{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Add Task Form */}
        <form action={addTask.bind(null, objectId)} className="flex gap-2 flex-wrap">
          <input
            name="title"
            type="text"
            placeholder="New task (e.g. Clean windows)"
            required
            className="flex-1 min-w-[200px] px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select name="repeat_type" defaultValue="none" className="px-3 py-2 border rounded-md text-sm">
            <option value="none">One time</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <Button type="submit" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </form>

        {/* Task List */}
        {tasks.length === 0 ? (
          <p className="text-center text-muted-foreground italic py-8">
            No tasks yet. Add one above!
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              // ← This is the fix: wrap entire return value in parentheses
              <div
                key={task.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  {task.is_done ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-400" />
                  )}

                  <div className="flex-1">
                    <p className={`font-medium ${task.is_done ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-xs">
                      {task.repeat_type !== "none" && (
                        <Badge variant="secondary">
                          <Repeat className="w-3 h-3 mr-1" />
                          {task.repeat_type}
                          {task.repeat_interval && task.repeat_interval > 1 && ` ×${task.repeat_interval}`}
                        </Badge>
                      )}
                      {task.next_due_date && (
                        (() => {
                          const nextDue = new Date(task.next_due_date)
                          const isOverdue = nextDue < new Date() && !task.is_done
                          const text = isOverdue
                            ? `Overdue ${formatDistanceToNow(nextDue, { addSuffix: true }).replace(" ago", "")}`
                            : `Next ${formatDistanceToNow(nextDue, { addSuffix: true })}`
                          return (
                            <Badge variant={isOverdue ? "destructive" : "outline"}>
                              <Calendar className="w-3 h-3 mr-1" />
                              {text}
                            </Badge>
                          )
                        })()}
                      )}
                    </div>
                  </div>
                </div>

                <form action={toggleTaskDone.bind(null, task.id, task.is_done, task)}>
                  <Button type="submit" variant={task.is_done ? "secondary" : "default"} size="sm">
                    {task.is_done ? "Undo" : "Done"}
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}