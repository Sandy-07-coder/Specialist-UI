import { useEffect, useState } from "react";
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
  SmilePlus,
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

// ── Mood config ────────────────────────────────────────────────────────────────
const MOOD_META = {
  happy: {
    label: "Happy",
    emoji: "😊",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    border: "border-emerald-300 dark:border-emerald-700",
    dot: "bg-emerald-500",
    icon: "mood",
  },
  sad: {
    label: "Sad",
    emoji: "😢",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-300 dark:border-blue-700",
    dot: "bg-blue-500",
    icon: "sentiment_dissatisfied",
  },
  angry: {
    label: "Angry",
    emoji: "😡",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    border: "border-red-300 dark:border-red-700",
    dot: "bg-red-500",
    icon: "mood_bad",
  },
  tired: {
    label: "Tired",
    emoji: "🥱",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    border: "border-purple-300 dark:border-purple-700",
    dot: "bg-purple-500",
    icon: "bedtime",
  },
};

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDayLabel(isoDate) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${DAY_SHORT[date.getDay()]} ${d} ${MONTH_SHORT[m - 1]}`;
}

function isToday(isoDate) {
  return new Date().toISOString().slice(0, 10) === isoDate;
}

// ── Mood History Card ──────────────────────────────────────────────────────────
function MoodHistoryCard({ studentId, token }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/students/${studentId}/mood-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load mood history.");
      setHistory(data.history); // oldest → newest
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [studentId, token]);

  // Compute most-frequent mood ("top vibe")
  const topVibe = (() => {
    const counts = {};
    for (const e of history) if (e.mood) counts[e.mood] = (counts[e.mood] ?? 0) + 1;
    if (!Object.keys(counts).length) return null;
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  })();

  const moodDaysRecorded = history.filter((e) => e.mood).length;

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Mood History
            <span className="ml-1 text-xs font-normal text-muted-foreground">— last 7 days</span>
          </CardTitle>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition disabled:opacity-40 px-2 py-1 rounded-lg hover:bg-accent"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        <CardDescription>One entry per day — the student's most recent mood check-in</CardDescription>
      </CardHeader>

      <CardContent className="pt-5 space-y-5">
        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2.5 text-sm flex items-center justify-between">
            {error}
            <button onClick={load} className="underline font-semibold ml-4">Retry</button>
          </div>
        )}

        {/* Summary strip */}
        {!loading && !error && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/60 border border-border text-sm">
              <SmilePlus className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Days recorded:</span>
              <span className="font-bold text-foreground">{moodDaysRecorded} / 7</span>
            </div>
            {topVibe && MOOD_META[topVibe] && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${MOOD_META[topVibe].bg} ${MOOD_META[topVibe].border} ${MOOD_META[topVibe].color}`}>
                <span>{MOOD_META[topVibe].emoji}</span>
                Top mood: {MOOD_META[topVibe].label}
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {loading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-full aspect-square rounded-xl bg-muted animate-pulse" />
                  <div className="h-2.5 w-8 rounded bg-muted animate-pulse" />
                </div>
              ))
            : history.map((entry, idx) => {
                const meta = entry.mood ? MOOD_META[entry.mood] : null;
                const today = isToday(entry.date);
                const isSelected = selected?.date === entry.date;
                const [, , d] = entry.date.split("-");
                const [y, m] = entry.date.split("-").map(Number);
                const dayName = DAY_SHORT[new Date(y, m - 1, Number(d)).getDay()];

                return (
                  <div key={entry.date} className="flex flex-col items-center gap-1.5">
                    <button
                      onClick={() => setSelected(isSelected ? null : entry)}
                      title={`${formatDayLabel(entry.date)}: ${meta?.label ?? "No mood recorded"}`}
                      className={`
                        relative w-full aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5
                        border-2 transition-all hover:scale-105 active:scale-95
                        ${meta ? `${meta.bg} ${meta.border}` : "bg-muted/40 border-border"}
                        ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}
                        ${today ? "shadow-md" : ""}
                      `}
                    >
                      {today && (
                        <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[9px] font-black bg-primary text-primary-foreground px-1.5 rounded-full whitespace-nowrap">
                          Today
                        </span>
                      )}
                      <span className={`text-xl sm:text-2xl select-none ${meta ? "" : "opacity-30"}`}>
                        {meta ? meta.emoji : "—"}
                      </span>
                    </button>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                      {dayName}
                    </span>
                    <span className="text-[9px] text-muted-foreground">{d}</span>
                  </div>
                );
              })}
        </div>

        {/* Selected day detail */}
        {selected && (
          <div
            className={`rounded-xl border p-4 flex items-center gap-4 transition-all ${
              selected.mood && MOOD_META[selected.mood]
                ? `${MOOD_META[selected.mood].bg} ${MOOD_META[selected.mood].border}`
                : "bg-muted/50 border-border"
            }`}
          >
            <div className="text-4xl">{selected.mood ? MOOD_META[selected.mood]?.emoji : "❓"}</div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                {formatDayLabel(selected.date)}{isToday(selected.date) ? " · Today" : ""}
              </p>
              <p className={`text-lg font-bold mt-0.5 ${
                selected.mood && MOOD_META[selected.mood]
                  ? MOOD_META[selected.mood].color
                  : "text-muted-foreground"
              }`}>
                {selected.mood ? MOOD_META[selected.mood]?.label : "No mood recorded"}
              </p>
              {selected.createdAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Logged at {new Date(selected.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-muted-foreground hover:text-foreground transition text-lg"
            >
              ×
            </button>
          </div>
        )}

        {/* Legend */}
        {!loading && !error && (
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.entries(MOOD_META).map(([key, m]) => (
              <div
                key={key}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${m.bg} ${m.border} ${m.color}`}
              >
                <span>{m.emoji}</span> {m.label}
              </div>
            ))}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted/40 border border-border text-muted-foreground">
              — Not recorded
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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

      {/* ── Progress Overview ─────────────────────────────────────────────────── */}
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
          {/* Task Completion only */}
          <div className="p-4 rounded-xl bg-muted/50 border border-border max-w-sm">
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
        </CardContent>
      </Card>

      {/* ── Mood History ──────────────────────────────────────────────────────── */}
      <MoodHistoryCard studentId={id} token={token} />

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
