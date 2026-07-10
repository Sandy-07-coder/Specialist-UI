import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useParams, NavLink } from "react-router-dom";
import { useTaskStore } from "@/store/useTaskStore";
import { useStudentStore } from "@/store/useStudentStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Filter,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCheck,
  RefreshCw,
  ImagePlus,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  Completed: {
    badge: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  },
  "In Progress": {
    badge: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
    icon: <Clock className="h-5 w-5 text-orange-500" />,
  },
  Pending: {
    badge: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
    icon: <Clock className="h-5 w-5 text-gray-400" />,
  },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// ─── Task Item ────────────────────────────────────────────────────────────────

const TaskItem = ({ task, onEdit, onDelete, onStatusToggle, isSubmitting }) => {
  const [expanded, setExpanded] = useState(false);
  const style = STATUS_STYLES[task.status] || STATUS_STYLES["Pending"];

  return (
    <div className="group border border-border/50 rounded-md p-4 bg-background/40 hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm mb-3">
      {/* Header row */}
      <div
        className="flex items-start sm:items-center justify-between cursor-pointer flex-col sm:flex-row gap-2"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <span className="group-hover:opacity-80 transition-opacity">{style.icon}</span>
          <div>
            <div
              className={`font-medium text-base transition-colors ${
                task.status === "Completed"
                  ? "text-muted-foreground line-through"
                  : "text-foreground group-hover:text-accent-foreground"
              }`}
            >
              {task.title}
            </div>
            <div className="text-xs text-muted-foreground group-hover:text-accent-foreground/80 mt-0.5 transition-colors flex items-center gap-2">
              Assigned: {formatDate(task.createdAt)}
              {task.imageUrl && (
                <span className="inline-flex items-center gap-1 text-primary/70">
                  <ImagePlus className="h-3 w-3" /> Image
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <Badge
            variant="outline"
            className={`text-xs font-normal border-transparent group-hover:bg-white/20 group-hover:text-white transition-colors ${style.badge}`}
          >
            {task.status}
          </Badge>

          {/* Quick status cycle button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground group-hover:bg-white/20 group-hover:text-white transition-colors"
            title="Cycle status"
            disabled={isSubmitting}
            onClick={(e) => {
              e.stopPropagation();
              onStatusToggle(task);
            }}
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground group-hover:bg-white/20 group-hover:text-white transition-colors"
            title="Edit task"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground group-hover:bg-white/20 group-hover:text-red-400 transition-colors"
            title="Delete task"
            disabled={isSubmitting}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground group-hover:bg-white/20 group-hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-4 pt-3 ml-0 sm:ml-8 pl-3 border-l-2 border-gray-300 dark:border-gray-600 group-hover:border-white/50 transition-colors space-y-3">
          {task.description && (
            <p className="text-sm text-muted-foreground group-hover:text-accent-foreground/90 whitespace-pre-wrap">
              {task.description}
            </p>
          )}
          {task.imageUrl && (
            <img
              src={task.imageUrl}
              alt="Task reference"
              className="rounded-md max-h-64 w-auto object-contain border border-border/50"
            />
          )}
        </div>
      )}
    </div>
  );
};

// ─── Task Form Modal (shared for Add & Edit) ──────────────────────────────────

const TaskFormModal = ({ open, onOpenChange, title, description, initialData, onSubmit, isSubmitting }) => {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskStatus, setTaskStatus] = useState("Pending");
  const [imageFile, setImageFile] = useState(null);       // File object
  const [imagePreview, setImagePreview] = useState("");   // local object URL for preview
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTaskTitle(initialData?.title || "");
      setTaskDesc(initialData?.description || "");
      setTaskStatus(initialData?.status || "Pending");
      setImageFile(null);
      setImagePreview("");
    }
  }, [open, initialData]);

  // Revoke the object URL when a new one is created to avoid memory leaks
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if (!taskTitle.trim()) return;
    onSubmit({ title: taskTitle.trim(), description: taskDesc.trim(), status: taskStatus }, imageFile);
  };

  // Show existing image from DB when editing (if no new file picked)
  const displayImage = imagePreview || (initialData?.imageUrl && !imageFile ? initialData.imageUrl : "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-muted-foreground">{description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-title" className="text-right text-foreground text-sm">
              Title
            </Label>
            <Input
              id="task-title"
              placeholder="e.g., Morning Routine"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="col-span-3 border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="task-desc" className="text-right mt-2 text-foreground text-sm">
              Details
            </Label>
            <textarea
              id="task-desc"
              placeholder="Task instructions or notes..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              className="col-span-3 flex min-h-[90px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-status" className="text-right text-foreground text-sm">
              Status
            </Label>
            <Select value={taskStatus} onValueChange={setTaskStatus}>
              <SelectTrigger id="task-status" className="col-span-3 border-border bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image (optional) */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right mt-2 text-foreground text-sm">
              Image
              <span className="block text-xs text-muted-foreground font-normal">optional</span>
            </Label>
            <div className="col-span-3 space-y-2">
              {displayImage ? (
                <div className="relative w-full rounded-md overflow-hidden border border-border/60">
                  <img
                    src={displayImage}
                    alt="Task preview"
                    className="w-full max-h-40 object-contain bg-muted/20"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-1.5 right-1.5 rounded-full bg-background/80 border border-border p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    title="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 w-full rounded-md border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-muted/30 transition-colors"
                >
                  <ImagePlus className="h-4 w-4" />
                  Click to attach a reference image
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpg,image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
              {imageFile && (
                <p className="text-xs text-muted-foreground truncate">{imageFile.name}</p>
              )}
            </div>
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
            disabled={!taskTitle.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…
              </>
            ) : (
              "Save Task"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

const DeleteConfirmModal = ({ open, onOpenChange, task, onConfirm, isSubmitting }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[380px] bg-card text-card-foreground border-border">
      <DialogHeader>
        <DialogTitle className="text-foreground flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-500" /> Delete Task
        </DialogTitle>
        <DialogDescription className="text-muted-foreground pt-1">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">"{task?.title}"</span>? This cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="gap-2">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
          className="border-border text-foreground hover:bg-accent"
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting…
            </>
          ) : (
            "Delete"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// ─── Status cycle order ───────────────────────────────────────────────────────
const STATUS_CYCLE = ["Pending", "In Progress", "Completed"];
const nextStatus = (current) =>
  STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];

// ─── Main Page ────────────────────────────────────────────────────────────────

export function StudentTasksPage() {
  const { id } = useParams();
  const token = useAuthStore((s) => s.token);

  // Student (from existing student store)
  const { fetchStudentById, currentStudent, isLoadingOne: isLoadingStudent } = useStudentStore();

  // Tasks
  const { tasks, isLoading, isSubmitting, error, fetchTasks, createTask, updateTask, deleteTask, clearTasks } =
    useTaskStore();

  const [filter, setFilter] = useState("All");

  // ── Modals ────────────────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // task being edited
  const [deleteTarget, setDeleteTarget] = useState(null); // task to delete

  // ── Load data on mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (id && token) {
      fetchStudentById(token, id);
      fetchTasks(token, id);
    }
    return () => clearTasks();
  }, [id, token]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAdd = useCallback(
    async (payload, imageFile) => {
      const result = await createTask(token, id, payload, imageFile);
      if (result.success) setAddOpen(false);
    },
    [token, id, createTask]
  );

  const handleEdit = useCallback(
    async (payload, imageFile) => {
      if (!editTarget) return;
      const result = await updateTask(token, id, editTarget._id, payload, imageFile);
      if (result.success) setEditTarget(null);
    },
    [token, id, editTarget, updateTask]
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const result = await deleteTask(token, id, deleteTarget._id);
    if (result.success) setDeleteTarget(null);
  }, [token, id, deleteTarget, deleteTask]);

  const handleStatusToggle = useCallback(
    async (task) => {
      await updateTask(token, id, task._id, { status: nextStatus(task.status) });
    },
    [token, id, updateTask]
  );

  // ── Derived ──────────────────────────────────────────────────────────────

  const filteredTasks = useMemo(
    () => tasks.filter((t) => filter === "All" || t.status === filter),
    [tasks, filter]
  );

  // ── Loading student ───────────────────────────────────────────────────────

  if (isLoadingStudent) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading student…</p>
      </div>
    );
  }

  if (!currentStudent && !isLoadingStudent) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in duration-500">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-foreground">Student Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">
          The student you are looking for does not exist or has been removed.
        </p>
        <NavLink
          to="/tasks"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm font-medium shadow transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </NavLink>
      </div>
    );
  }

  const student = currentStudent;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12 w-full max-w-5xl mx-auto">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex items-center gap-4">
          <NavLink
            to="/tasks"
            className="p-2 border border-border rounded-full hover:bg-accent hover:text-accent-foreground transition text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </NavLink>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              Tasks: {student?.name}
            </h1>
            <p className="text-muted-foreground mt-1">Review assigned task progress and history</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border text-muted-foreground hover:text-foreground"
            onClick={() => fetchTasks(token, id)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {/* Add Task */}
          <Button className="gap-2" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        </div>
      </header>

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Task List Card ── */}
      <Card className="border-border bg-card text-card-foreground/50 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filter Status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Pending", "In Progress", "Completed"].map((f) => (
              <Badge
                key={f}
                variant={filter === f ? "default" : "outline"}
                className={`cursor-pointer ${
                  filter === f ? "" : "hover:bg-accent hover:text-accent-foreground text-muted-foreground border-border"
                }`}
                onClick={() => setFilter(f)}
              >
                {f}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex flex-col items-center py-12 text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Loading tasks…</p>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="flex flex-col">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onEdit={(t) => setEditTarget(t)}
                  onDelete={(t) => setDeleteTarget(t)}
                  onStatusToggle={handleStatusToggle}
                  isSubmitting={isSubmitting}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-lg bg-muted/30">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-medium">
                No tasks found{filter !== "All" ? ` for "${filter}" status` : ""}
              </p>
              {filter !== "All" ? (
                <Button
                  variant="link"
                  className="mt-2 text-muted-foreground"
                  onClick={() => setFilter("All")}
                >
                  Clear filters
                </Button>
              ) : (
                <Button
                  variant="link"
                  className="mt-2 text-muted-foreground"
                  onClick={() => setAddOpen(true)}
                >
                  Assign the first task
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add Task Modal ── */}
      <TaskFormModal
        open={addOpen}
        onOpenChange={setAddOpen}
        title={`Assign New Task to ${student?.name}`}
        description="Create a new task and assign it directly."
        onSubmit={handleAdd}
        isSubmitting={isSubmitting}
      />

      {/* ── Edit Task Modal ── */}
      <TaskFormModal
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
        title="Edit Task"
        initialData={editTarget}
        onSubmit={handleEdit}
        isSubmitting={isSubmitting}
      />

      {/* ── Delete Confirm Modal ── */}
      <DeleteConfirmModal
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        task={deleteTarget}
        onConfirm={handleDelete}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
