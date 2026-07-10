import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useStudentStore } from "@/store/useStudentStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

// ─── Mini task preview in the card ───────────────────────────────────────────

const TaskItem = ({ task }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group border border-border/50 rounded-md p-3 mb-2 bg-muted/40 hover:bg-accent hover:text-accent-foreground transition-colors">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {task.status === "Completed" ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
          ) : (
            <Clock className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
          )}
          <span className="font-medium text-sm text-foreground group-hover:text-accent-foreground truncate">
            {task.title}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 flex-shrink-0 text-muted-foreground group-hover:bg-white/20 group-hover:text-accent-foreground"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      {expanded && task.description && (
        <div className="mt-3 text-sm text-muted-foreground group-hover:text-accent-foreground/90 whitespace-pre-wrap pl-1 border-l-2 border-gray-300 dark:border-gray-600 group-hover:border-white/50">
          {task.description}
        </div>
      )}
    </div>
  );
};

// ─── Per-student card ─────────────────────────────────────────────────────────

const StudentTaskCard = ({ student }) => {
  // We derive a simple completion label from assessmentStatus as a placeholder.
  // Real task completion % can be wired once tasks are fetched per student.
  const initials = student.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const taskCompletion = student.taskCompletion || "—";

  return (
    <Card className="h-full bg-card text-card-foreground border-border flex flex-col shadow-sm hover:shadow-md dark:hover:border-slate-700 transition-all border-l-2 border-l-primary/30 hover:border-l-primary/60">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-slate-100 dark:border-slate-900/50">
            <AvatarImage src={student.image} alt={student.name} />
            <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg text-foreground truncate">{student.name}</CardTitle>
            <CardDescription className="text-xs mt-1 flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 dark:text-slate-400 truncate">{student.diagnosis}</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-slate-500 dark:text-slate-400">
                Completion:{" "}
                <span className="font-semibold text-primary">{taskCompletion}</span>
              </span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex-1 flex flex-col">
        <div className="space-y-1 flex-1">
          <h4 className="text-sm font-semibold mb-3 text-foreground flex items-center justify-between">
            Recent Completed Tasks
            <Badge
              variant="secondary"
              className="font-normal text-xs bg-muted text-muted-foreground border-transparent"
            >
              {student.recentCompletedCount ?? 0}
            </Badge>
          </h4>

          {student.recentCompleted && student.recentCompleted.length > 0 ? (
            <div className="space-y-2 bg-slate-50/80 dark:bg-slate-800/30 rounded-lg p-2">
              {student.recentCompleted.map((task) => (
                <TaskItem key={task._id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-6 italic border border-dashed border-slate-200 dark:border-slate-700 rounded-md bg-slate-50/50 dark:bg-slate-800/20">
              No recent completed tasks.
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-border/60 text-center">
          <Link
            to={`/students/${student._id}/tasks`}
            className="text-sm text-primary hover:text-primary/70 hover:underline font-medium"
          >
            View all tasks →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Add Task Modal ───────────────────────────────────────────────────────────

const AddTaskModal = ({ open, onOpenChange, students, token }) => {
  const { createTask, isSubmitting } = useTaskStore();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");

  const reset = () => {
    setSelectedStudentId("");
    setTaskTitle("");
    setTaskDesc("");
  };

  const handleSubmit = useCallback(async () => {
    if (!selectedStudentId || !taskTitle.trim()) return;
    const result = await createTask(token, selectedStudentId, {
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      status: "Pending",
    });
    if (result.success) {
      reset();
      onOpenChange(false);
    }
  }, [token, selectedStudentId, taskTitle, taskDesc, createTask, onOpenChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-[440px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Assign New Task</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new task and assign it to a student.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Student picker */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-foreground text-sm">Student</Label>
            <div className="col-span-3">
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger className="border-border bg-background text-foreground">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {students.map((s) => (
                    <SelectItem
                      key={s._id}
                      value={s._id}
                      className="text-foreground focus:bg-accent cursor-pointer"
                    >
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="modal-title" className="text-right text-foreground text-sm">
              Title
            </Label>
            <Input
              id="modal-title"
              placeholder="e.g., Morning Routine"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="col-span-3 border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="modal-desc" className="text-right mt-2 text-foreground text-sm">
              Details
            </Label>
            <textarea
              id="modal-desc"
              placeholder="Task details and instructions..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              className="col-span-3 flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="border-border text-foreground hover:bg-accent"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!selectedStudentId || !taskTitle.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Assigning…
              </>
            ) : (
              "Assign Task"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const token = useAuthStore((s) => s.token);
  const { students, isLoading, error, fetchStudents } = useStudentStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch students on mount (all of them for this overview, up to 50)
  useEffect(() => {
    if (token) {
      fetchStudents(token, { page: 1, limit: 50 });
    }
  }, [token]);

  // ── Enrich student list with recent completed tasks ───────────────────────
  // The TasksPage shows a snapshot; for deep task management the user goes to StudentTasksPage.
  // We add placeholder `recentCompleted` fields. (Full per-student task fetch happens on StudentTasksPage.)
  const enrichedStudents = students.map((s) => ({
    ...s,
    recentCompleted: [],
    recentCompletedCount: 0,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Task Management</h2>
          <p className="text-muted-foreground">Manage and assign tasks to your students.</p>
        </div>

        <Button className="gap-2" onClick={() => setIsDialogOpen(true)} disabled={isLoading || students.length === 0}>
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="text-sm">Loading students…</p>
        </div>
      ) : enrichedStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground font-medium">No students found.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add students first before assigning tasks.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {enrichedStudents.map((student) => (
            <StudentTaskCard key={student._id} student={student} />
          ))}
        </div>
      )}

      {/* ── Add Task Modal ── */}
      <AddTaskModal
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        students={students}
        token={token}
      />
    </div>
  );
}
