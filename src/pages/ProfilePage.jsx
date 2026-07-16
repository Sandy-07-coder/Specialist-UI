import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building,
  Briefcase,
  Award,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Users,
  ListTodo,
  CheckSquare,
  Edit,
  Camera,
  Loader2,
  User,
  TrendingUp,
  Smile,
  Frown,
  Meh,
  Zap,
  Heart,
  RefreshCw,
  BarChart2,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useUserStore, useAuthStore } from "@/store";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";

// ─── Mood icon/colour mapping ─────────────────────────────────────────────────
const MOOD_META = {
  happy:    { label: "Happy",    color: "#22c55e", bg: "rgba(34,197,94,0.15)",    Icon: Smile },
  sad:      { label: "Sad",      color: "#3b82f6", bg: "rgba(59,130,246,0.15)",   Icon: Frown },
  angry:    { label: "Angry",    color: "#ef4444", bg: "rgba(239,68,68,0.15)",    Icon: Zap },
  tired:    { label: "Tired",    color: "#a855f7", bg: "rgba(168,85,247,0.15)",   Icon: Meh },
  excited:  { label: "Excited",  color: "#f59e0b", bg: "rgba(245,158,11,0.15)",  Icon: Heart },
  calm:     { label: "Calm",     color: "#06b6d4", bg: "rgba(6,182,212,0.15)",    Icon: Activity },
};
const getMoodMeta = (mood) =>
  MOOD_META[mood?.toLowerCase()] ?? {
    label: mood ?? "Unknown",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.12)",
    Icon: Meh,
  };

// ─── Circular progress ring (SVG) ─────────────────────────────────────────────
function ProgressRing({ pct = 0, size = 52, stroke = 5, color = "#6366f1" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor"
        className="text-muted/30" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
}

// ─── Progress Overview Card ───────────────────────────────────────────────────
function ProgressOverviewSection({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOverview = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_BASE}/specialist/progress-overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load progress data.");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message || "Error fetching overview.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  if (loading) {
    return (
      <Card className="border-border bg-card text-card-foreground shadow-sm">
        <CardContent className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading progress data…</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border bg-card text-card-foreground shadow-sm">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
          <p className="text-sm text-red-500">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchOverview} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const {
    totalStudents,
    totalTasks,
    completedTasks,
    pendingTasks,
    inProgressTasks,
    completionRate,
    moodDistribution,
    studentProgress,
  } = data;

  // Sort moods by count descending
  const moodEntries = Object.entries(moodDistribution).sort((a, b) => b[1] - a[1]);
  const maxMoodCount = moodEntries[0]?.[1] || 1;

  return (
    <div className="space-y-6">
      {/* ── Section header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Progress Overview</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchOverview} className="gap-1.5 text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* ── Top stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Students", value: totalStudents, Icon: Users, color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
          { label: "Total Tasks", value: totalTasks,  Icon: ListTodo, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
          { label: "Completed",  value: completedTasks, Icon: CheckSquare, color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
          { label: "Completion", value: `${completionRate}%`, Icon: BarChart2, color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
        ].map(({ label, value, Icon, color, bg }) => (
          <Card key={label} className="border-border bg-card text-card-foreground shadow-sm">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Task status breakdown + Mood distribution ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Task status breakdown */}
        <Card className="border-border bg-card text-card-foreground shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Activity className="w-4 h-4 text-indigo-500" />
              Task Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            {[
              { label: "Completed",   count: completedTasks,  color: "#22c55e" },
              { label: "In Progress", count: inProgressTasks, color: "#f59e0b" },
              { label: "Pending",     count: pendingTasks,    color: "#94a3b8" },
            ].map(({ label, count, color }) => {
              const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
              return (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">{label}</span>
                    <span className="text-muted-foreground">{count} <span className="text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Mood distribution */}
        <Card className="border-border bg-card text-card-foreground shadow-sm">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Smile className="w-4 h-4 text-amber-500" />
              Mood History Distribution
            </CardTitle>
            <CardDescription className="text-xs">Based on mood-tagged tasks</CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            {moodEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm italic border border-dashed border-border rounded-lg bg-muted/30">
                <Meh className="w-7 h-7 mb-2 opacity-40" />
                No mood data recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {moodEntries.map(([mood, count]) => {
                  const meta = getMoodMeta(mood);
                  const pct = Math.round((count / maxMoodCount) * 100);
                  return (
                    <div key={mood} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}>
                        <meta.Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-foreground capitalize">{meta.label}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: meta.color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Per-student progress ── */}
      <Card className="border-border bg-card text-card-foreground shadow-sm">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <Users className="w-4 h-4 text-blue-500" />
            Student Task Completion
          </CardTitle>
          <CardDescription className="text-xs">Individual progress for each student</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {studentProgress.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground text-sm italic border border-dashed border-border rounded-lg bg-muted/30">
              <Users className="w-7 h-7 mb-2 opacity-40" />
              No students found.
            </div>
          ) : (
            <div className="space-y-4">
              {studentProgress.map((s) => {
                const moodMeta = s.latestMood ? getMoodMeta(s.latestMood) : null;
                return (
                  <div key={String(s._id)} className="flex items-center gap-4 group">
                    {/* Ring */}
                    <div className="relative flex-shrink-0">
                      <ProgressRing pct={s.completionRate} color="#6366f1" />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground">
                        {s.completionRate}%
                      </span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground truncate">{s.name}</span>
                        {moodMeta && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{ background: moodMeta.bg, color: moodMeta.color }}
                          >
                            <moodMeta.Icon className="w-2.5 h-2.5" />
                            {moodMeta.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{s.diagnosis}</p>
                      <div className="flex gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        <span><span className="text-green-500 font-semibold">{s.completed}</span> done</span>
                        <span><span className="text-amber-500 font-semibold">{s.inProgress}</span> in progress</span>
                        <span><span className="text-slate-400 font-semibold">{s.pending}</span> pending</span>
                      </div>
                    </div>
                    {/* Mini bar */}
                    <div className="hidden sm:block w-24 flex-shrink-0">
                      <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${s.completionRate}%`, background: "#6366f1" }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 text-right">{s.total} task{s.total !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────
export function ProfilePage() {
  const { name } = useParams();
  const isPersonal = !name;

  // ── Store ──────────────────────────────────────────────────────────────────
  const {
    isProfileLoaded,
    isLoading,
    fetchProfile,
    updateProfile,
    uploadPhoto,
    getDisplayProfile,
  } = useUserStore();
  const token = useAuthStore((s) => s.token);
  const profileUrl = useUserStore((s) => s.profileUrl);

  const [isUploading, setIsUploading] = useState(false);

  // Fetch full profile on mount if it hasn't been loaded yet
  useEffect(() => {
    if (isPersonal && !isProfileLoaded && token) {
      fetchProfile(token);
    }
  }, [isPersonal, isProfileLoaded, token, fetchProfile]);

  // ── Derived profile data ───────────────────────────────────────────────────
  const storeProfile = getDisplayProfile();

  const specialistName = isPersonal
    ? (storeProfile.name ?? "Specialist")
    : decodeURIComponent(name);

  // ── Local edit state ───────────────────────────────────────────────────────
  const [editForm, setEditForm] = useState({
    name: "",
    domain: "",
    institution: "",
    experience: "",
    serviceDomains: "",
    assessmentMethods: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenEdit = () => {
    setEditForm({
      name: storeProfile.name ?? "",
      domain: storeProfile.serviceDomain ?? "",
      institution: storeProfile.institutionName ?? "",
      experience: storeProfile.experience ?? "",
      serviceDomains: (storeProfile.focusAreas ?? []).join(", "),
      assessmentMethods: "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    updateProfile({
      name: editForm.name,
      serviceDomain: editForm.domain,
      institutionName: editForm.institution,
      experience: editForm.experience,
      focusAreas: editForm.serviceDomains.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setIsModalOpen(false);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    await uploadPhoto(file, token);
    setIsUploading(false);
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isPersonal && isLoading && !isProfileLoaded) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground gap-3">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading your profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Specialist Portfolio
        </h1>
        <p className="text-muted-foreground mt-2">
          {name ? `Professional profile of ${specialistName}` : "Your professional snapshot"}
        </p>
      </header>

      {/* ── Email verification warning (personal profile only) ── */}
      {isPersonal && <EmailVerificationBanner />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Essential Info */}
        <Card className="col-span-1 border-border bg-card text-card-foreground shadow-sm flex flex-col items-center p-6 text-center relative">
          {isPersonal && (
            <Button onClick={handleOpenEdit} variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
              <Edit className="w-4 h-4" />
            </Button>
          )}
          <div className="relative w-32 h-32 rounded-full border-4 border-border shadow-sm overflow-hidden mb-5 group flex items-center justify-center bg-gray-200 dark:bg-gray-800">
            {profileUrl ? (
              <img src={profileUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
            )}
            {isPersonal && (
              <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white z-10">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium tracking-wide">Edit</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={isUploading} />
              </label>
            )}
          </div>
          <h2 className="text-2xl font-bold text-foreground">{storeProfile.name ?? specialistName}</h2>
          <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary">
            {storeProfile.serviceDomain ?? "Specialist"}
          </Badge>

          <Separator className="my-6 w-full" />

          <div className="w-full space-y-4 text-left">
            <div className="flex items-center gap-3 text-foreground">
              <Building className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Institution</p>
                <p className="text-sm font-medium">{storeProfile.institutionName ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-foreground">
              <Briefcase className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="text-sm font-medium">{storeProfile.experience ?? "—"}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column - Domains & Assessments */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          {/* Focus Areas */}
          <Card className="border-border bg-card text-card-foreground shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1.5">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <Award className="w-5 h-5 text-indigo-500" />
                  Focus Areas
                </CardTitle>
                <CardDescription>Areas of expertise and intervention.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {(storeProfile.focusAreas ?? []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {storeProfile.focusAreas.map((area, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-md border border-indigo-100 dark:border-indigo-800/50 text-sm font-medium">
                      <BookOpen className="w-4 h-4" />
                      {area}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground border border-dashed border-border rounded-lg bg-muted/50">
                  <BookOpen className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm italic">No focus areas specified yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Service Domain Detail */}
          <Card className="border-border bg-card text-card-foreground shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1.5">
                <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                  <ClipboardCheck className="w-5 h-5 text-emerald-500" />
                  Service Domain
                </CardTitle>
                <CardDescription>Primary intervention category.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {storeProfile.serviceDomain ? (
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-3 py-2 rounded-md border border-emerald-100 dark:border-emerald-800/50 text-sm font-medium w-fit">
                  <ClipboardCheck className="w-4 h-4" />
                  {storeProfile.serviceDomain}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted-foreground border border-dashed border-border rounded-lg bg-muted/50">
                  <GraduationCap className="w-8 h-8 mb-2 opacity-50 text-muted-foreground" />
                  <p className="text-sm italic">No service domain currently specified.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Progress Overview (live data) ── */}
      <Separator />
      <ProgressOverviewSection token={token} />

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Profile Information</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 mt-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-foreground">Name</Label>
              <Input id="name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="col-span-3 text-gray-800 dark:text-gray-200" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="domain" className="text-right text-foreground">Domain</Label>
              <Input id="domain" value={editForm.domain} onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })} className="col-span-3 text-gray-800 dark:text-gray-200" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="institution" className="text-right text-foreground">Institution</Label>
              <Input id="institution" value={editForm.institution} onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })} className="col-span-3 text-gray-800 dark:text-gray-200" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="experience" className="text-right text-foreground">Experience</Label>
              <Input id="experience" value={editForm.experience} onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })} className="col-span-3 text-gray-800 dark:text-gray-200" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="serviceDomains" className="text-right text-foreground">Focus Areas</Label>
              <Input placeholder="Comma separated values" id="serviceDomains" value={editForm.serviceDomains} onChange={(e) => setEditForm({ ...editForm, serviceDomains: e.target.value })} className="col-span-3 text-foreground" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
