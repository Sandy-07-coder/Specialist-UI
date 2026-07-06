import { useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import {
  ArrowLeft,
  User,
  FileText,
  ClipboardList,
  AlertCircle,
  Loader2,
  CalendarDays,
  Venus,
  Mars,
  CircleUser,
  CheckCircle2,
  Clock,
  BadgeAlert,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStudentStore } from "@/store/useStudentStore";
import { useAuthStore } from "@/store";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Format an ISO date string → dd/mm/yyyy */
function formatDob(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("en-GB");
}

/** Compute age in years from an ISO date string */
function computeAge(isoString) {
  if (!isoString) return null;
  const dob = new Date(isoString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

/** Gender icon component */
function GenderIcon({ gender }) {
  if (gender === "Male") return <Mars className="w-4 h-4 text-sky-500" />;
  if (gender === "Female") return <Venus className="w-4 h-4 text-pink-500" />;
  return <CircleUser className="w-4 h-4 text-muted-foreground" />;
}

/** Reusable info row used inside the profile card */
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground leading-none mb-1">{label}</p>
        <p className="text-sm font-medium text-foreground">{value || "—"}</p>
      </div>
    </div>
  );
}

// ── Loading skeleton ───────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-80 rounded-xl bg-muted" />
        <div className="lg:col-span-2 h-80 rounded-xl bg-muted" />
      </div>
      <div className="h-40 rounded-xl bg-muted" />
      <div className="h-32 rounded-xl bg-muted" />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export function StudentDetailsPage() {
  const { id } = useParams();
  const { token } = useAuthStore();
  const {
    currentStudent: student,
    isLoadingOne,
    error,
    fetchStudentById,
  } = useStudentStore();

  useEffect(() => {
    if (token && id) {
      fetchStudentById(token, id);
    }
  }, [token, id, fetchStudentById]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoadingOne) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-4">
          <NavLink
            to="/students"
            className="p-2 border border-border rounded-full hover:bg-accent transition text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </NavLink>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">Loading student profile…</span>
          </div>
        </div>
        <ProfileSkeleton />
      </div>
    );
  }

  // ── Error / Not Found ──────────────────────────────────────────────────────
  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {error || "Student Not Found"}
        </h2>
        <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
          The student profile you're looking for doesn't exist or you don't have
          access to it.
        </p>
        <NavLink
          to="/students"
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 text-sm font-medium shadow transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </NavLink>
      </div>
    );
  }

  const age = computeAge(student.dob);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12 w-full max-w-7xl mx-auto">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center gap-4">
          <NavLink
            to="/students"
            className="p-2 border border-border rounded-full hover:bg-accent hover:text-accent-foreground transition text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </NavLink>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              {student.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Student Profile</p>
          </div>
        </div>

        {/* Assessment status pill */}
        <div className="shrink-0">
          {student.assessmentStatus === "completed" ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
              Assessment Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Clock className="w-4 h-4" />
              Assessment Pending
            </span>
          )}
        </div>
      </header>

      {/* ── Top Grid: Profile Card + Right Column ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Profile Info Card */}
        <Card className="col-span-1 border-border bg-card shadow-sm">
          <CardContent className="pt-6">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-border flex items-center justify-center shadow-sm mb-4">
                <span className="text-3xl font-bold text-primary select-none">
                  {student.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
              {age !== null && (
                <p className="text-sm text-muted-foreground mt-1">{age} years old</p>
              )}
              <div className="mt-3">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-medium">
                  {student.diagnosis}
                </Badge>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Detail Rows */}
            <div className="space-y-4">
              <InfoRow
                icon={<CalendarDays className="w-4 h-4" />}
                label="Date of Birth"
                value={formatDob(student.dob)}
              />
              <InfoRow
                icon={<GenderIcon gender={student.gender} />}
                label="Gender"
                value={student.gender}
              />
              <InfoRow
                icon={<BadgeAlert className="w-4 h-4" />}
                label="Diagnosis"
                value={student.diagnosis}
              />
              <InfoRow
                icon={<CalendarDays className="w-4 h-4" />}
                label="Registered On"
                value={new Date(student.createdAt).toLocaleDateString("en-GB")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Right: Notes + Assessment */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">

          {/* Specialist Notes */}
          <Card className="flex-1 border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Specialist Notes
              </CardTitle>
              <CardDescription>Observations and context recorded at registration</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {student.notes && student.notes.trim() ? (
                <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl">
                  <p className="text-foreground leading-relaxed italic border-l-4 border-amber-300 dark:border-amber-700 pl-4 py-1">
                    "{student.notes}"
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <FileText className="w-8 h-8 opacity-30 mb-2" />
                  <p className="text-sm italic">No notes recorded for this student.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assessment Status Card */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="w-4 h-4 text-muted-foreground" />
                Assessment
              </CardTitle>
              <CardDescription>Current assessment status for this student</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {student.assessmentStatus === "completed" ? (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                      Assessment Completed
                    </p>
                    <p className="text-sm text-emerald-600/80 dark:text-emerald-400/70 mt-0.5">
                      This student has completed their assessment test.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-amber-700 dark:text-amber-300">
                      Assessment Pending
                    </p>
                    <p className="text-sm text-amber-600/80 dark:text-amber-400/70 mt-0.5">
                      The assessment has not been completed yet.
                    </p>
                  </div>
                  <NavLink
                    to={`/assessment?studentId=${student._id}`}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Start Test
                  </NavLink>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ── Bottom: Progress Overview ─────────────────────────────────────────── */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-muted-foreground" />
            Progress Overview
          </CardTitle>
          <CardDescription>
            Task completion and mood tracking — populated as activity is recorded
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Task Completion */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                Task Completion
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: student.taskCompletion || "0%" }}
                  />
                </div>
                <span className="text-sm font-semibold text-foreground shrink-0">
                  {student.taskCompletion || "0%"}
                </span>
              </div>
            </div>

            {/* Mood */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                Last Recorded Mood
              </p>
              <p className="text-sm font-semibold text-foreground">
                {student.mood
                  ? student.mood
                  : <span className="italic font-normal text-muted-foreground">Not recorded yet</span>
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
