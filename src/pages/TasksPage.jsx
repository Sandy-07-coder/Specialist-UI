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
    <div className="border border-gray-200 dark:border-gray-700/50 rounded-md p-3 mb-2 bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-medium text-sm text-gray-900 dark:text-gray-200">{task.title}</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      {expanded && (
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap pl-1 border-l-2 border-gray-300 dark:border-gray-600">
          {task.description}
        </div>
      )}
    </div>
  );
};


const StudentTaskCard = ({ student }) => {
  return (
    <Card className="h-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 flex flex-col shadow-sm dark:shadow-none hover:shadow-md dark:hover:border-gray-700 transition-all">
      <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-blue-100 dark:border-blue-900/50">
            <AvatarImage src={student.image} alt={student.name} />
            <AvatarFallback className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">{student.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{student.name}</CardTitle>
            <CardDescription className="text-xs mt-1 flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">{student.diagnosis}</span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-gray-500 dark:text-gray-400">Completion: <span className="font-semibold text-gray-900 dark:text-gray-200">{student.taskCompletion}</span></span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col">
        <div className="space-y-1 flex-1">
          <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 flex items-center justify-between">
            Recent Completed Tasks
            <Badge variant="secondary" className="font-normal text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border-transparent">{student.tasks?.filter(t => t.status === "Completed").length || 0}</Badge>
          </h4>
          {student.tasks && student.tasks.filter(t => t.status === "Completed").length > 0 ? (
            <div className="space-y-2">
              {student.tasks.filter(t => t.status === "Completed").slice(0, 3).map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
             <div className="text-sm text-gray-500 dark:text-gray-500 text-center py-6 italic border border-dashed border-gray-200 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-gray-900/50">
               No recent completed tasks.
             </div>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/60 text-center">
          <Link to={`/students/${student.id}/tasks`} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium">
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
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Task Management</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage and assign tasks to your students.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-gray-100">Assign New Task</DialogTitle>
              <DialogDescription className="text-gray-500 dark:text-gray-400">
                Create a new task and assign it to a student.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="student" className="text-right text-gray-700 dark:text-gray-300">
                  Student
                </Label>
                <div className="col-span-3">
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                        <SelectTrigger className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500">
                            <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            {students.map(student => (
                                <SelectItem key={student.id} value={student.id} className="text-gray-900 dark:text-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer">{student.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right text-gray-700 dark:text-gray-300">
                  Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Morning Routine"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="col-span-3 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right mt-2 text-gray-700 dark:text-gray-300">
                  Description
                </Label>
                <textarea
                  id="description"
                  placeholder="Task details and instructions..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="col-span-3 flex min-h-[80px] w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm ring-offset-white dark:ring-offset-gray-900 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddTask} disabled={!newTaskTitle || !newTaskDesc || !selectedStudentId} className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-500">
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
