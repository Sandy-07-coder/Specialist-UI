import React, { useMemo, useEffect, useState } from "react";
import { useParams, NavLink, useLocation } from "react-router-dom";
import { studentsData } from "@/data/students";
import { ArrowLeft, User, Activity, AlertCircle, FileText, CheckCircle2, Clock, ChevronDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  Label,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

const TaskItem = ({ task }) => {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = task.status === "Completed";

  return (
    <div className="border border-border/50 rounded-md p-3 bg-muted/40 hover:bg-accent hover:text-accent-foreground/80 transition-colors">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Clock className="h-5 w-5 text-orange-500" />
          )}
          <span className={`font-medium text-sm ${isCompleted ? 'text-muted-foreground line-through' : 'text-gray-900 dark:text-gray-200'}`}>
            {task.title}
          </span>
          <Badge variant={isCompleted ? "outline" : "default"} className={`ml-2 text-xs font-normal border-transparent ${isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
            {task.status || "Pending"}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 text-muted-foreground hover:text-gray-900 dark:hover:text-gray-100">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
      {expanded && (
        <div className="mt-3 ml-8 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap pl-3 border-l-2 border-gray-300 dark:border-gray-600">
          {task.description}
        </div>
      )}
    </div>
  );
};

export function StudentDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const student = useMemo(() => studentsData.find(s => s.id === id), [id]);

  useEffect(() => {
    if (location.search.includes("tab=tasks")) {
      const taskSection = document.getElementById("assigned-tasks");
      if (taskSection) {
        taskSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location.search]);

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in duration-500">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-foreground">Student Not Found</h2>
        <p className="text-muted-foreground mt-2 mb-6">
          The student you are looking for does not exist or has been removed.
        </p>
        <NavLink
          to="/students"
          className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm font-medium shadow"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Students
        </NavLink>
      </div>
    );
  }

  // --- Task History Chart Config ---
  const taskChartConfig = {
    tasks: {
      label: "Tasks Completed",
      color: "hsl(var(--chart-1))",
    },
  };

  // --- Mood History Pie Config ---
  const moodChartConfig = {
    Happy: { label: "Happy", color: "hsl(var(--chart-1))" },
    Sad: { label: "Sad", color: "hsl(var(--chart-2))" },
    Overwhelmed: { label: "Overwhelmed", color: "hsl(var(--chart-3))" },
    Angry: { label: "Angry", color: "hsl(var(--chart-4))" },
    Tired: { label: "Tired", color: "hsl(var(--chart-5))" },
    Anxious: { label: "Anxious", color: "hsl(var(--chart-2))" },
  };

  const moodData = student.mood_history.map((m) => ({
    ...m,
    fill: `var(--color-${m.mood})`
  }));

  // --- Progress Radar Config ---
  const progressChartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12 w-full max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div className="flex items-center gap-4">
          <NavLink
            to="/students"
            className="p-2 border border-border rounded-full hover:bg-accent hover:text-accent-foreground transition text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </NavLink>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight flex items-center gap-3">
              Student Details
            </h1>
          </div>
        </div>
      </header>

      {/* Top Section: Profile info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Main Portrait & Basic Info */}
        <Card className="col-span-1 border-border bg-card text-card-foreground/50 shadow-sm">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <img 
              src={student.image} 
              alt={student.name} 
              className="w-32 h-32 rounded-full object-cover border-4 border-border shadow-sm"
            />
            <h2 className="mt-4 text-2xl font-bold text-foreground">{student.name}</h2>
            <p className="text-muted-foreground font-medium">Age: {student.age} yrs</p>
            
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary font-medium tracking-wide">
                {student.diagnosis}
              </Badge>
              <Badge variant="outline" className={`${student.support_level === 'High' ? 'border-red-200 text-red-700 bg-red-50 dark:border-red-900 dark:text-red-400 dark:bg-red-500/10' : student.support_level === 'Medium' ? 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-900 dark:text-orange-400 dark:bg-orange-500/10' : 'border-green-200 text-green-700 bg-green-50 dark:border-green-900 dark:text-green-400 dark:bg-green-500/10'}`}>
                {student.support_level} Support
              </Badge>
            </div>
            
            <Separator className="my-6" />

            <div className="w-full text-left space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" /> Assigned Specialists
                </h4>
                <div className="flex flex-col gap-2">
                  {student.assigned_specialists.map(sp => (
                    <div key={sp} className="text-sm text-foreground bg-gray-100 dark:bg-gray-800/80 p-2 rounded-md border border-border/50">
                      {sp}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-gray-500" /> Overall Completion
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gray-900 dark:bg-gray-100 h-2 rounded-full" 
                      style={{ width: student.taskCompletion }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">{student.taskCompletion}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Col: Notes and Specific info */}
        <Card className="col-span-1 lg:col-span-2 border-border bg-card text-card-foreground/50 shadow-sm flex flex-col justify-center">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500 outline-none" /> Specialist Notes
            </CardTitle>
            <CardDescription>Current observations and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic border-l-4 border-amber-300 dark:border-amber-700 pl-4 py-1">
                "{student.specialist_notes}"
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: Assigned Tasks */}
      <Card id="assigned-tasks" className="border-border bg-card text-card-foreground/50 shadow-sm scroll-mt-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" /> Assigned Tasks
            </CardTitle>
            <CardDescription className="mt-1">All current and past tasks assigned to this student</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">
            {student.tasks?.length || 0} Tasks Total
          </Badge>
        </CardHeader>
        <CardContent className="pt-6">
          {student.tasks && student.tasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.tasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground italic">
              No tasks are currently assigned to this student.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Section: Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Task History (Bar Chart) */}
        <Card className="flex flex-col shadow-sm border-border">
          <CardHeader className="items-center pb-2">
            <CardTitle className="text-lg">Task History (7 Days)</CardTitle>
            <CardDescription>Daily task completion volume</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={taskChartConfig} className="mx-auto aspect-[4/3] w-full mt-4">
              <BarChart accessibilityLayer data={student.task_history} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="tasks" fill="var(--color-tasks)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Mood History (Pie Chart) */}
        <Card className="flex flex-col shadow-sm border-border">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-lg">Mood History</CardTitle>
            <CardDescription>Distribution of states over time</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={moodChartConfig} className="mx-auto aspect-square max-h-[250px] w-full">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="mood" />}
                />
                <Pie
                  data={moodData}
                  dataKey="value"
                  nameKey="mood"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {student.mood}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-xs"
                            >
                              Current Mood
                            </tspan>
                          </text>
                        )
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Progress Tracker (Radar Chart) */}
        <Card className="flex flex-col shadow-sm border-border">
          <CardHeader className="items-center pb-4">
            <CardTitle className="text-lg">Progress Tracker</CardTitle>
            <CardDescription>Overall spectrum metrics</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={progressChartConfig} className="mx-auto aspect-[4/3] w-full mt-2 h-[220px]">
              <RadarChart data={student.progress_metrics}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <PolarAngleAxis dataKey="subject" />
                <PolarGrid />
                <Radar
                  dataKey="score"
                  fill="var(--color-score)"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
