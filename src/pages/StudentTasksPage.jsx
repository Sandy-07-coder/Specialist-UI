import React, { useMemo, useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import { studentsData } from "@/data/students";
import { ArrowLeft, Clock, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Filter, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const TaskItem = ({ task }) => {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = task.status === "Completed";
  
  // mock an assigned date if not exist
  const dateStr = task.assignedDate || "Mar 20, 2026";

  return (
    <div className="border border-border/50 rounded-md p-4 bg-background/40 hover:bg-accent hover:text-accent-foreground/80 transition-colors shadow-sm mb-3">
      <div 
        className="flex items-start sm:items-center justify-between cursor-pointer flex-col sm:flex-row gap-2" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Clock className="h-5 w-5 text-orange-500" />
          )}
          <div>
            <div className={`font-medium text-base ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
              {task.title}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Assigned: {dateStr}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <Badge variant={isCompleted ? "outline" : "default"} className={`text-xs font-normal border-transparent ${isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
            {task.status || "Pending"}
          </Badge>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-accent text-muted-foreground hover:text-accent-foreground">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="mt-4 pt-3 ml-0 sm:ml-8 text-sm text-muted-foreground whitespace-pre-wrap pl-3 border-l-2 border-gray-300 dark:border-gray-600">
          {task.description}
        </div>
      )}
    </div>
  );
};

export function StudentTasksPage() {
  const { id } = useParams();
  const [filter, setFilter] = useState("All");
  
  const student = useMemo(() => studentsData.find(s => s.id === id), [id]);
  const [tasks, setTasks] = useState([]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  useEffect(() => {
    if (student) {
      setTasks(student.tasks || []);
    }
  }, [student]);

  const handleAddTask = () => {
    if (!newTaskTitle || !newTaskDesc) return;

    const newTask = {
      id: `t${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDesc,
      status: "In Progress",
      assignedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    
    if (student) {
      student.tasks = updatedTasks;
    }

    setNewTaskTitle("");
    setNewTaskDesc("");
    setIsDialogOpen(false);
  };

  if (!student) {
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

  const filteredTasks = tasks.filter(t => filter === "All" || t.status === filter);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12 w-full max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex items-center gap-4">
          <NavLink
            to="/tasks"
            className="p-2 border border-border rounded-full hover:bg-accent hover:text-accent-foreground transition text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </NavLink>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight flex items-center gap-3">
              Tasks: {student.name}
            </h1>
            <p className="text-muted-foreground mt-1">Review assigned task progress and history</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2  ">
              <Plus className="h-4 w-4" /> Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Assign New Task to {student.name}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Create a new task and assign it directly.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right text-foreground">
                  Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Morning Routine"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="col-span-3 border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right mt-2 text-foreground">
                  Description
                </Label>
                <textarea
                  id="description"
                  placeholder="Task details and instructions..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="col-span-3 flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-white dark:ring-offset-gray-900 placeholder:text-muted-foreground text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddTask} disabled={!newTaskTitle || !newTaskDesc} className="  ">
                Assign Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="border-border bg-card text-card-foreground/50 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-border gap-4">
          <div className="flex items-center gap-2">
             <Filter className="w-4 h-4 text-muted-foreground" />
             <span className="text-sm font-medium text-foreground">Filter Status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "In Progress", "Completed", "Pending"].map((f) => (
              <Badge 
                key={f}
                variant={filter === f ? "default" : "outline"}
                className={`cursor-pointer ${filter === f ? '' : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground border-border'}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredTasks.length > 0 ? (
            <div className="flex flex-col">
              {filteredTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-lg bg-muted/30">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-muted-foreground font-medium">No tasks found for "{filter}" status</p>
              <Button variant="link" className="mt-2 text-muted-foreground" onClick={() => setFilter("All")}>
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
