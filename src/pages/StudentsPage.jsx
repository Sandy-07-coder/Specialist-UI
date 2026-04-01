import { useState, useMemo } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { studentsData } from "@/data/students";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [diagnosisFilter, setDiagnosisFilter] = useState("All");
  const [moodFilter, setMoodFilter] = useState("All");
  const [completionFilter, setCompletionFilter] = useState("All");
  const navigate = useNavigate();

  const filteredStudents = useMemo(() => {
    return studentsData.filter(student => {
      // Name Search Filter
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Mood Trend Filter
      let matchesMood = true;
      if (moodFilter !== "All") {
        matchesMood = student.mood === moodFilter;
      }

      // Diagnosis Filter
      let matchesDiagnosis = true;
      if (diagnosisFilter !== "All") {
        matchesDiagnosis = student.diagnosis.includes(diagnosisFilter);
      }

      // Task Completion Filter
      let matchesCompletion = true;
      const completionNum = parseInt(student.taskCompletion);
      if (completionFilter === "< 50%") matchesCompletion = completionNum < 50;
      else if (completionFilter === "50% - 80%") matchesCompletion = completionNum >= 50 && completionNum <= 80;
      else if (completionFilter === "> 80%") matchesCompletion = completionNum > 80;

      return matchesSearch && matchesMood && matchesDiagnosis && matchesCompletion;
    });
  }, [searchTerm, moodFilter, diagnosisFilter, completionFilter]);

  const uniqueDiagnoses = useMemo(() => {
    const diags = new Set();
    studentsData.forEach(s => {
      const parts = s.diagnosis.split(', ');
      parts.forEach(p => diags.add(p));
    });
    return Array.from(diags).sort();
  }, []);

  const uniqueMoods = useMemo(() => {
    const moods = new Set();
    studentsData.forEach(s => {
      if(s.mood) moods.add(s.mood);
    });
    return Array.from(moods).sort();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
            Students
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Mapping the unique journeys of your classroom community
          </p>
        </div>
        <div className="shrink-0">
          <Button onClick={() => navigate('/students/new')} className=" w-full sm:w-auto shadow-md shadow-primary/20 active:scale-[0.98] transition-all duration-200">
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>
      </header>

      {/* Filters Section */}
      <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-md shadow-gray-200/50 dark:shadow-none flex flex-col xl:flex-row gap-4 transition-all duration-300">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search students by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-muted text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-sm"
          />
        </div>

        {/* Filters Wrapper */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground pl-1 w-full sm:w-auto mb-1 sm:mb-0">
            <Filter className="w-4 h-4" />
            <span>Filters:</span>
          </div>

          <Select value={diagnosisFilter} onValueChange={setDiagnosisFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Diagnosis: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Diagnosis: All</SelectItem>
              {uniqueDiagnoses.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={moodFilter} onValueChange={setMoodFilter}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="Mood: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Mood: All</SelectItem>
              {uniqueMoods.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={completionFilter} onValueChange={setCompletionFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Completion: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Completion: All</SelectItem>
              <SelectItem value="< 50%">Needs Support {"(< 50%)"}</SelectItem>
              <SelectItem value="50% - 80%">On Track (50 - 80%)</SelectItem>
              <SelectItem value="> 80%">Doing Great {"> 80%"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-md shadow-gray-200/50 dark:shadow-none overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="py-3 px-4 text-sm font-semibold text-foreground whitespace-nowrap">Name</th>
                <th className="py-3 px-4 text-sm font-semibold text-foreground whitespace-nowrap">Age</th>
                <th className="py-3 px-4 text-sm font-semibold text-foreground whitespace-nowrap">Diagnosis</th>
                <th className="py-3 px-4 text-sm font-semibold text-foreground whitespace-nowrap hidden sm:table-cell">Last Mood</th>
                <th className="py-3 px-4 text-sm font-semibold text-foreground whitespace-nowrap">Task Completion</th>
                <th className="py-3 px-4 text-sm font-semibold text-foreground text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-accent hover:text-accent-foreground/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-foreground whitespace-nowrap">{student.name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">{student.age}</td>
                    <td className="py-3 px-4 text-sm whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 ring-1 ring-inset ring-slate-700/10 dark:ring-slate-400/20">
                        {student.diagnosis}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden sm:table-cell whitespace-nowrap">{student.mood}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground min-w-[120px]">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-muted rounded-full h-2 max-w-[4rem]">
                          <div className="bg-primary h-2 rounded-full" style={{ width: student.taskCompletion }}></div>
                        </div>
                        <span className="text-xs">{student.taskCompletion}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-right whitespace-nowrap">
                      <NavLink to={`/students/${student.id}`} className="text-foreground hover:underline font-medium transition-colors">
                        View
                      </NavLink>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-muted-foreground text-sm">
                    No students match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
