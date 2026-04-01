import React, { useState } from "react";
import { Link } from "react-router-dom";
import { studentsData } from "../data/students";
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
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"


const TaskItem = ({ task }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border/50 rounded-md p-3 mb-2 bg-muted/40 hover:bg-accent hover:text-accent-foreground/80 transition-colors">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-medium text-sm text-foreground">{task.title}</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-accent text-muted-foreground hover:text-accent-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      {expanded && (
        <div className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap pl-1 border-l-2 border-gray-300 dark:border-gray-600">
          {task.description}
        </div>
      )}
    </div>
  );
};


const StudentTaskCard = ({ student }) => {
  return (
    <Card className="h-full bg-card text-card-foreground border-border flex flex-col shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-gray-700 transition-all">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-slate-100 dark:border-slate-900/50">
            <AvatarImage src={student.image} alt={student.name} />
            <AvatarFallback className="bg-primary/10 text-primary">{student.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg text-foreground">{student.name}</CardTitle>
            <CardDescription className="text-xs mt-1 flex items-center gap-2">
              <span className="text-muted-foreground">{student.diagnosis}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">Completion: <span className="font-semibold text-foreground">{student.taskCompletion}</span></span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col">
        <div className="space-y-1 flex-1">
          <h4 className="text-sm font-semibold mb-3 text-foreground flex items-center justify-between">
            Recent Completed Tasks
            <Badge variant="secondary" className="font-normal text-xs bg-muted text-muted-foreground hover:bg-accent border-transparent">{student.tasks?.filter(t => t.status === "Completed").length || 0}</Badge>
          </h4>
          {student.tasks && student.tasks.filter(t => t.status === "Completed").length > 0 ? (
            <div className="space-y-2">
              {student.tasks.filter(t => t.status === "Completed").slice(0, 3).map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
             <div className="text-sm text-muted-foreground text-center py-6 italic border border-dashed border-border rounded-md bg-muted/50">
               No recent completed tasks.
             </div>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-border/60 text-center">
          <Link to={`/students/${student.id}/tasks`} className="text-sm text-primary hover:text-slate-800 dark:hover:text-slate-300 hover:underline font-medium">
            View all tasks
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default function TasksPage() {
  const [students, setStudents] = useState(studentsData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const handleAddTask = () => {
    if (!newTaskTitle || !newTaskDesc || !selectedStudentId) return;

    const newTask = {
      id: `t${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDesc,
      status: "In Progress"
    };

    setStudents(prevStudents => 
      prevStudents.map(student => {
        if (student.id === selectedStudentId) {
          return {
            ...student,
            tasks: [...(student.tasks || []), newTask]
          };
        }
        return student;
      })
    );

    setNewTaskTitle("");
    setNewTaskDesc("");
    setSelectedStudentId("");
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Task Management</h2>
          <p className="text-muted-foreground">Manage and assign tasks to your students.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2  ">
              <Plus className="h-4 w-4" /> Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Assign New Task</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Create a new task and assign it to a student.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="student" className="text-right text-foreground">
                  Student
                </Label>
                <div className="col-span-3">
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                        <SelectTrigger className="border-border bg-background text-foreground placeholder:text-muted-foreground">
                            <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-border">
                            {students.map(student => (
                                <SelectItem key={student.id} value={student.id} className="text-foreground focus:bg-accent cursor-pointer">{student.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              </div>

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
              <Button type="submit" onClick={handleAddTask} disabled={!newTaskTitle || !newTaskDesc || !selectedStudentId} className="  ">
                Assign Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {students.map((student) => (
          <StudentTaskCard key={student.id} student={student} />
        ))}
      </div>
    </div>
  );
}
