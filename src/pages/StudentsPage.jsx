import { useState, useEffect, useCallback } from "react";
import { Search, Filter, Plus, X, ChevronLeft, ChevronRight, Loader2, ClipboardList, SkipForward, UserPlus } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStudentStore } from "@/store/useStudentStore";
import { useAuthStore } from "@/store";

// ── Helpers ────────────────────────────────────────────────────────────────────
const MOOD_BADGE = {
  Happy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  Neutral: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Sad: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const DIAGNOSES = ["ADHD", "Autism", "Dyslexia", "Dyscalculia", "Dysgraphia", "Other"];

// ── Add Student Modal ──────────────────────────────────────────────────────────
function AddStudentModal({ onClose, onSuccess }) {
  const { isAdding, addStudent } = useStudentStore();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    dob: "",
    gender: "",
    diagnosis: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [assessmentChoice, setAssessmentChoice] = useState(null); // null | 'take' | 'skip'

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required.";
    // Validate dd/mm/yyyy format and that it's a real past date
    const dobRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!form.dob || !dobRegex.test(form.dob)) {
      e.dob = "Enter a valid date in dd/mm/yyyy format.";
    } else {
      const [d, m, y] = form.dob.split("/").map(Number);
      const parsed = new Date(y, m - 1, d);
      if (
        parsed.getFullYear() !== y ||
        parsed.getMonth() !== m - 1 ||
        parsed.getDate() !== d ||
        parsed >= new Date()
      ) {
        e.dob = "Enter a valid past date.";
      }
    }
    if (!form.gender) e.gender = "Please select a gender.";
    if (!form.diagnosis.trim()) e.diagnosis = "Diagnosis is required.";
    if (!assessmentChoice) e.assessment = "Please choose an assessment option.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const result = await addStudent(token, {
      name: form.name.trim(),
      dob: form.dob,           // sent as dd/mm/yyyy; backend parses it
      gender: form.gender,
      diagnosis: form.diagnosis.trim(),
      notes: form.notes.trim(),
      assessmentStatus: "pending",
    });

    if (result.success) {
      if (assessmentChoice === "take") {
        // Navigate to assessment page with the new student's id
        navigate(`/assessment?studentId=${result.student._id}`);
      } else {
        onSuccess?.();
        onClose();
      }
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={handleBackdrop}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Add New Student</h2>
              <p className="text-xs text-muted-foreground">Fill in the student details below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Arjun Sharma"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.name ? "border-destructive" : "border-border"}`}
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* DOB + Gender row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Date of Birth <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="dd/mm/yyyy"
                value={form.dob}
                maxLength={10}
                onChange={(e) => {
                  // Auto-insert slashes for UX: 2 digits → insert /, 5 digits → insert /
                  let v = e.target.value.replace(/[^\d/]/g, "");
                  if (v.length === 2 && !v.includes("/")) v += "/";
                  if (v.length === 5 && v.split("/").length === 2) v += "/";
                  set("dob", v);
                }}
                className={`w-full px-3 py-2 rounded-lg border text-sm bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.dob ? "border-destructive" : "border-border"}`}
              />
              {errors.dob && <p className="mt-1 text-xs text-destructive">{errors.dob}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Gender <span className="text-destructive">*</span>
              </label>
              <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                <SelectTrigger className={`w-full ${errors.gender ? "border-destructive" : ""}`}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gender && <p className="mt-1 text-xs text-destructive">{errors.gender}</p>}
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Diagnosis <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ADHD, Dyslexia"
              value={form.diagnosis}
              list="diagnosis-suggestions"
              onChange={(e) => set("diagnosis", e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.diagnosis ? "border-destructive" : "border-border"}`}
            />
            <datalist id="diagnosis-suggestions">
              {DIAGNOSES.map((d) => <option key={d} value={d} />)}
            </datalist>
            {errors.diagnosis && (
              <p className="mt-1 text-xs text-destructive">{errors.diagnosis}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Notes <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <textarea
              placeholder="Any additional observations or context..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border text-sm bg-muted text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none"
            />
          </div>

          {/* Assessment Section */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Assessment Test <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Would you like to take the assessment now or skip it for later?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* Take Assessment */}
              <button
                type="button"
                onClick={() => setAssessmentChoice("take")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${assessmentChoice === "take"
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                  }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${assessmentChoice === "take"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                  }`}>
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-semibold ${assessmentChoice === "take" ? "text-primary" : "text-foreground"}`}>
                    Take Assessment
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Start the test now</p>
                </div>
                {assessmentChoice === "take" && (
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Skip Assessment */}
              <button
                type="button"
                onClick={() => setAssessmentChoice("skip")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${assessmentChoice === "skip"
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10"
                    : "border-border hover:border-amber-400/40 hover:bg-muted/50"
                  }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${assessmentChoice === "skip"
                    ? "bg-amber-500 text-white"
                    : "bg-muted text-muted-foreground"
                  }`}>
                  <SkipForward className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-semibold ${assessmentChoice === "skip" ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
                    Skip Assessment
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Complete it later</p>
                </div>
                {assessmentChoice === "skip" && (
                  <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
            {errors.assessment && (
              <p className="mt-2 text-xs text-destructive">{errors.assessment}</p>
            )}
          </div>

          {/* Store error */}
          {useStudentStore.getState().error && (
            <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {useStudentStore.getState().error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isAdding}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isAdding} className="min-w-[140px]">
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding…
              </>
            ) : assessmentChoice === "take" ? (
              <>
                <ClipboardList className="w-4 h-4 mr-2" />
                Add & Start Test
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Student
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export function StudentsPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { students, pagination, isLoading, fetchStudents } = useStudentStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const LIMIT = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // reset to page 1 on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch students whenever page or search changes
  const loadStudents = useCallback(() => {
    if (token) {
      fetchStudents(token, { page: currentPage, limit: LIMIT, search: debouncedSearch });
    }
  }, [token, currentPage, debouncedSearch, fetchStudents]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleModalClose = () => setShowModal(false);
  const handleStudentAdded = () => loadStudents();

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Header */}
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
            <Button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto shadow-md shadow-primary/20 active:scale-[0.98] transition-all duration-200"
            >
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

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground pl-1">
              <Filter className="w-4 h-4" />
              <span>Filters:</span>
            </div>
            {/* Placeholder selects — backend filtering can be extended later */}
            <Select defaultValue="All">
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Diagnosis: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Diagnosis: All</SelectItem>
                {DIAGNOSES.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card text-card-foreground border border-border rounded-xl shadow-md shadow-gray-200/50 dark:shadow-none overflow-hidden transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b-2 border-primary/20">
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">Name</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">DOB</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:table-cell">Gender</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">Diagnosis</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">Assessment</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-sm">Loading students…</span>
                      </div>
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <tr
                      key={student._id}
                      className="group hover:bg-accent hover:text-accent-foreground transition-colors odd:bg-white even:bg-slate-50/70 dark:odd:bg-transparent dark:even:bg-slate-800/20"
                    >
                      <td className="py-3 px-4 text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-accent-foreground whitespace-nowrap">
                        {student.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 group-hover:text-accent-foreground/90 whitespace-nowrap">
                        {student.dob
                          ? new Date(student.dob).toLocaleDateString('en-GB') // formats as dd/mm/yyyy
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell whitespace-nowrap group-hover:text-accent-foreground/90">
                        {student.gender}
                      </td>
                      <td className="py-3 px-4 text-sm whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/8 text-primary dark:bg-primary/15 dark:text-primary ring-1 ring-inset ring-primary/20 group-hover:bg-white/20 group-hover:text-white group-hover:ring-white/30 transition-colors">
                          {student.diagnosis}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm whitespace-nowrap">
                        {student.assessmentStatus === "completed" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            ✓ Done
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                            ⏳ Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-right whitespace-nowrap">
                        <NavLink
                          to={`/students/${student._id}`}
                          className="text-primary group-hover:text-accent-foreground hover:underline font-medium text-xs transition-colors"
                        >
                          View →
                        </NavLink>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                          <UserPlus className="w-6 h-6 opacity-40" />
                        </div>
                        <p className="text-sm font-medium">
                          {debouncedSearch ? "No students match your search." : "No students yet."}
                        </p>
                        {!debouncedSearch && (
                          <button
                            onClick={() => setShowModal(true)}
                            className="text-xs text-primary hover:underline"
                          >
                            Add your first student →
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">{pagination.total}</span>{" "}
                students
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-1">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <AddStudentModal
          onClose={handleModalClose}
          onSuccess={handleStudentAdded}
        />
      )}
    </>
  );
}
