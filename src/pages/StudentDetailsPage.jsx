import { useEffect, useState, useCallback } from "react";
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
  Lock,
  Mail,
  Copy,
  Check,
  RefreshCw,
  Users,
  Eye,
  EyeOff,
  TrendingUp,
  Smile,
  Frown,
  Meh,
  Zap,
  Heart,
  Activity,
  ListTodo,
  CheckSquare,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// ── Mood meta helpers ──────────────────────────────────────────────────────────
const MOOD_META = {
  happy:   { label: "Happy",   color: "#22c55e", bg: "rgba(34,197,94,0.13)",   Icon: Smile  },
  sad:     { label: "Sad",     color: "#3b82f6", bg: "rgba(59,130,246,0.13)",  Icon: Frown  },
  angry:   { label: "Angry",   color: "#ef4444", bg: "rgba(239,68,68,0.13)",   Icon: Zap    },
  tired:   { label: "Tired",   color: "#a855f7", bg: "rgba(168,85,247,0.13)",  Icon: Meh    },
  excited: { label: "Excited", color: "#f59e0b", bg: "rgba(245,158,11,0.13)",  Icon: Heart  },
  calm:    { label: "Calm",    color: "#06b6d4", bg: "rgba(6,182,212,0.13)",   Icon: Activity },
};
const getMoodMeta = (mood) =>
  MOOD_META[mood?.toLowerCase()] ?? {
    label: mood ? (mood.charAt(0).toUpperCase() + mood.slice(1)) : "Unknown",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.12)",
    Icon: Meh,
  };

// ── Circular SVG ring ──────────────────────────────────────────────────────────
function ProgressRing({ pct = 0, size = 64, stroke = 6, color = "#6366f1" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="currentColor" className="text-muted/30" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.7s ease" }} />
    </svg>
  );
}

// ── Live Student Progress Section ─────────────────────────────────────────────
function StudentProgressSection({ studentId, token }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = useCallback(async () => {
    if (!token || !studentId) return;
    setLoading(true);
    setError("");
    try {
      const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const res  = await fetch(`${base}/specialist/students/${studentId}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load progress.");
      setData(await res.json());
    } catch (e) {
      setError(e.message || "Error fetching progress.");
    } finally {
      setLoading(false);
    }
  }, [token, studentId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-14 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">Loading progress data…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
        <p className="text-sm text-red-500">{error}</p>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const {
    totalTasks, completedTasks, pendingTasks, inProgressTasks,
    completionRate, moodDistribution, moodTimeline, latestMood,
  } = data;

  const moodEntries  = Object.entries(moodDistribution).sort((a, b) => b[1] - a[1]);
  const maxMoodCount = moodEntries[0]?.[1] || 1;
  const latestMeta   = latestMood ? getMoodMeta(latestMood) : null;

  return (
    <div className="space-y-6">

      {/* ── Stat row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Tasks",  value: totalTasks,     Icon: ListTodo,    color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
          { label: "Completed",    value: completedTasks,  Icon: CheckSquare, color: "#22c55e", bg: "rgba(34,197,94,0.12)"   },
          { label: "In Progress",  value: inProgressTasks, Icon: Activity,    color: "#6366f1", bg: "rgba(99,102,241,0.12)"  },
          { label: "Pending",      value: pendingTasks,    Icon: Clock,       color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="flex flex-col items-center justify-center p-4 rounded-xl bg-muted/40 border border-border text-center gap-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: bg }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Completion ring + status bars ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Ring */}
        <div className="flex items-center gap-6 p-5 rounded-xl bg-muted/40 border border-border">
          <div className="relative shrink-0">
            <ProgressRing pct={completionRate} color="#6366f1" />
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground" style={{ transform: "none" }}>
              {completionRate}%
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Task Completion</p>
            <p className="text-xs text-muted-foreground mt-1">
              {completedTasks} of {totalTasks} task{totalTasks !== 1 ? "s" : ""} completed
            </p>
            {latestMeta && (
              <span
                className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: latestMeta.bg, color: latestMeta.color }}
              >
                <latestMeta.Icon className="w-3 h-3" />
                Latest mood: {latestMeta.label}
              </span>
            )}
            {!latestMeta && (
              <p className="text-xs text-muted-foreground mt-3 italic">No mood recorded yet</p>
            )}
          </div>
        </div>

        {/* Status bars */}
        <div className="p-5 rounded-xl bg-muted/40 border border-border space-y-4">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" /> Status Breakdown
          </p>
          {[
            { label: "Completed",   count: completedTasks,  color: "#22c55e" },
            { label: "In Progress", count: inProgressTasks, color: "#6366f1" },
            { label: "Pending",     count: pendingTasks,    color: "#94a3b8" },
          ].map(({ label, count, color }) => {
            const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
            return (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground font-medium">{label}</span>
                  <span className="text-muted-foreground">{count} ({pct}%)</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mood distribution + Timeline ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Mood distribution */}
        <div className="p-5 rounded-xl bg-muted/40 border border-border">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <Smile className="w-4 h-4 text-amber-500" /> Mood Distribution
          </p>
          {moodEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-xs italic">
              <Meh className="w-6 h-6 mb-2 opacity-40" /> No mood data yet
            </div>
          ) : (
            <div className="space-y-3">
              {moodEntries.map(([mood, count]) => {
                const meta = getMoodMeta(mood);
                const pct  = Math.round((count / maxMoodCount) * 100);
                return (
                  <div key={mood} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: meta.bg }}>
                      <meta.Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-foreground capitalize">{meta.label}</span>
                        <span className="text-muted-foreground">{count}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: meta.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mood timeline */}
        <div className="p-5 rounded-xl bg-muted/40 border border-border">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" /> Mood History
          </p>
          {moodTimeline.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-xs italic">
              <Frown className="w-6 h-6 mb-2 opacity-40" /> No mood events recorded
            </div>
          ) : (
            <ul className="space-y-2.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
              {moodTimeline.map((item, i) => {
                const meta = getMoodMeta(item.mood);
                const d    = new Date(item.date);
                const label = d.toLocaleDateString("en-GB", {
                  day: "2-digit", month: "short", year: "numeric",
                });
                return (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: meta.bg }}>
                      <meta.Icon className="w-3 h-3" style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground capitalize truncate">
                        {meta.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate" title={item.taskTitle}>
                        {item.taskTitle}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
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
    fetchStudentCredentials,
    setStudentCredentials,
  } = useStudentStore();

  // ── Credentials state ──────────────────────────────────────────────────────
  const [creds, setCreds] = useState(null);          // fetched from API
  const [credsLoading, setCredsLoading] = useState(false);
  const [credsError, setCredsError]   = useState('');
  const [credsSaving, setCredsSaving] = useState(false);
  const [credsSaved,  setCredsSaved]  = useState(false);

  const [editEmail,    setEditEmail]    = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showPass,     setShowPass]     = useState(false);
  const [copiedField,  setCopiedField]  = useState(null); // 'username' | 'password'

  useEffect(() => {
    if (token && id) {
      fetchStudentById(token, id);
    }
  }, [token, id, fetchStudentById]);

  // Load credentials when student is loaded
  useEffect(() => {
    if (!token || !id) return;
    setCredsLoading(true);
    fetchStudentCredentials(token, id).then((res) => {
      if (res.success) {
        setCreds(res.credentials);
        setEditEmail(res.credentials.email || '');
        setEditUsername(res.credentials.username || '');
      }
      setCredsLoading(false);
    });
  }, [token, id, fetchStudentCredentials]);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleSaveCredentials = async (extra = {}) => {
    setCredsError('');
    setCredsSaving(true);
    setCredsSaved(false);

    const payload = {
      email: editEmail.trim(),
      ...(editUsername.trim() ? { username: editUsername.trim() } : {}),
      ...(editPassword.trim() ? { password: editPassword.trim() } : {}),
      ...extra,
    };

    const res = await setStudentCredentials(token, id, payload);
    setCredsSaving(false);

    if (!res.success) {
      setCredsError(res.error || 'Failed to save credentials.');
      return;
    }

    setCreds(prev => ({
      ...prev,
      username: res.data.username,
      email:    res.data.email,
      defaultPassword: res.data.defaultPassword,
    }));
    setEditUsername(res.data.username);
    setEditPassword('');
    setCredsSaved(true);
    setTimeout(() => setCredsSaved(false), 3000);
  };

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
              {student.assessmentStatus === "completed" ? (() => {
                // Severity → colour mapping
                const SEV_COLOR = {
                  "No Autism":       { bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", bar: "bg-emerald-500" },
                  "Mild Autism":     { bg: "bg-amber-50 dark:bg-amber-900/20",   border: "border-amber-200 dark:border-amber-800",   text: "text-amber-700 dark:text-amber-300",   badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",   bar: "bg-amber-500"   },
                  "Moderate Autism": { bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-800", text: "text-orange-700 dark:text-orange-300", badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300", bar: "bg-orange-500" },
                  "Severe Autism":   { bg: "bg-red-50 dark:bg-red-900/20",       border: "border-red-200 dark:border-red-800",       text: "text-red-700 dark:text-red-300",       badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",           bar: "bg-red-500"     },
                };
                const sev = student.assessmentSeverity || "No Autism";
                const c   = SEV_COLOR[sev] || SEV_COLOR["No Autism"];
                const score = student.assessmentScore ?? 0;
                const pct   = Math.round((score / 200) * 100);
                const takenAt = student.assessmentTakenAt
                  ? new Date(student.assessmentTakenAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })
                  : null;

                return (
                  <div className={`rounded-xl border ${c.border} ${c.bg} overflow-hidden`}>
                    {/* Top bar */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-inherit">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-semibold text-foreground">Assessment Completed</span>
                      </div>
                      {takenAt && (
                        <span className="text-xs text-muted-foreground">{takenAt}</span>
                      )}
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
                      {/* Method */}
                      <div className="px-4 py-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Method</p>
                        <p className="text-sm font-bold text-foreground">{student.assessmentType || "ISAA"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Indian Scale for Assessment of Autism</p>
                      </div>

                      {/* Score */}
                      <div className="px-4 py-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Score</p>
                        <p className={`text-2xl font-black ${c.text}`}>{score}<span className="text-sm font-normal text-muted-foreground ml-1">/ 200</span></p>
                        <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                          <div className={`${c.bar} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      {/* Severity */}
                      <div className="px-4 py-4">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Severity</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${c.badge}`}>{sev}</span>
                        <p className="text-xs text-muted-foreground mt-2">
                          {sev === "No Autism"       && "Score < 70"}
                          {sev === "Mild Autism"     && "Score 70–106"}
                          {sev === "Moderate Autism" && "Score 107–153"}
                          {sev === "Severe Autism"   && "Score > 153"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-amber-700 dark:text-amber-300">Assessment Pending</p>
                    <p className="text-sm text-amber-600/80 dark:text-amber-400/70 mt-0.5">The assessment has not been completed yet.</p>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4 text-primary" />
                Progress Overview
              </CardTitle>
              <CardDescription className="mt-1">
                Live task completion and mood history for this student
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <StudentProgressSection studentId={id} token={token} />
        </CardContent>
      </Card>

      {/* ── Account Setup / Credentials ──────────────────────────────────────── */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="w-4 h-4 text-purple-500" />
            Account Setup
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            Manage the student's SpecialKid-UI login credentials.
            {creds && (
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                creds.hasCredentials
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
              }`}>
                {creds.hasCredentials ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {creds.hasCredentials ? 'Active' : 'Not set up'}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-5 space-y-6">

          {credsLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading credentials…
            </div>
          )}

          {!credsLoading && creds && (
            <>
              {/* Current credentials summary */}
              {creds.hasCredentials && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-muted/60 border border-border p-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Username</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-bold text-foreground flex-1 truncate">{creds.username}</p>
                      <button onClick={() => handleCopy(creds.username, 'username')} className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                        {copiedField === 'username' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/60 border border-border p-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Default Password</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-bold text-foreground flex-1">{creds.defaultPassword}</p>
                      <button onClick={() => handleCopy(creds.defaultPassword, 'password')} className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                        {copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted/60 border border-border p-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Parent / Guardian</p>
                    <p className="text-sm font-semibold text-foreground truncate">{creds.parentName || '—'}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{creds.email || 'No email set'}</p>
                  </div>
                </div>
              )}

              {/* Edit form */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">
                  {creds.hasCredentials ? 'Update Credentials' : 'Set Up Login Access'}
                </h4>

                {credsError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2.5 rounded-xl text-sm">
                    {credsError}
                  </div>
                )}
                {credsSaved && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Credentials saved successfully.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="creds-email" className="text-foreground flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" /> Parent Email
                    </Label>
                    <Input id="creds-email" type="email"
                      value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="parent@email.com"
                      className="bg-muted border-border text-foreground" />
                  </div>

                  {/* Username with regenerate */}
                  <div className="space-y-1.5">
                    <Label htmlFor="creds-username" className="text-foreground flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" /> Username
                    </Label>
                    <div className="flex gap-2">
                      <Input id="creds-username"
                        value={editUsername} onChange={(e) => setEditUsername(e.target.value)}
                        placeholder="auto-generated"
                        className="bg-muted border-border text-foreground" />
                      <Button
                        type="button" size="icon" variant="outline"
                        title="Re-generate from student + parent name"
                        className="shrink-0"
                        onClick={() => handleSaveCredentials({ regenerateUsername: true })}
                        disabled={credsSaving}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Format: student_parent (e.g. liam_sarah). A 2-digit suffix is added if taken.</p>
                  </div>

                  {/* New password */}
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="creds-password" className="text-foreground flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" /> New Password
                      <span className="text-muted-foreground font-normal text-xs">(leave blank to keep current)</span>
                    </Label>
                    <div className="relative max-w-sm">
                      <Input id="creds-password" type={showPass ? 'text' : 'password'}
                        value={editPassword} onChange={(e) => setEditPassword(e.target.value)}
                        placeholder={`Default: ${creds.defaultPassword}`}
                        className="bg-muted border-border text-foreground pr-10" />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Default: first 4 chars of first name + birth year ({creds.defaultPassword})
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveCredentials()} disabled={credsSaving}>
                    {credsSaving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
                    ) : creds.hasCredentials ? 'Save Credentials' : 'Activate Account'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
