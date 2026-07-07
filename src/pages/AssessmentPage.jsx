import { useState } from "react";
import { useSearchParams, NavLink } from "react-router-dom";
import {
  ClipboardList,
  Brain,
  Microscope,
  BarChart3,
  Star,
  PlusCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Building2,
  User,
  FileText,
  Send,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ── Assessment tools catalogue ─────────────────────────────────────────────────
const ASSESSMENTS = [
  {
    id: "isaa",
    abbr: "ISAA",
    title: "Indian Scale for Assessment of Autism",
    subtitle: "Indian Scale for Assessment of Autism",
    description:
      "A standardised 40-item scale developed for Indian children, covering social relationship & reciprocity, emotional responsiveness, speech, language & communication, behaviour patterns, sensory aspects, and cognitive component domains.",
    tags: ["India-specific", "Ages 2–9", "40 items"],
    accent: "blue",
    icon: Brain,
  },
  {
    id: "inclen",
    abbr: "INCLEN-INDT",
    title: "INCLEN Diagnostic Tool for ASD",
    subtitle: "INCLEN-INDT-ASD",
    description:
      "A diagnostic tool specifically validated for use in Indian settings by INCLEN. Designed to support early identification of Autism Spectrum Disorder with strong cultural sensitivity.",
    tags: ["Diagnostic", "Validated India", "Multicenter"],
    accent: "violet",
    icon: Microscope,
  },
  {
    id: "iasq",
    abbr: "IASQ",
    title: "Indian Autism Screening Questionnaire",
    subtitle: "Indian Autism Screening Questionnaire",
    description:
      "A rapid parent/caregiver-completed screening questionnaire developed for use in the Indian population. Designed for primary healthcare settings as an early triage tool.",
    tags: ["Screening", "Parent-report", "Primary Care"],
    accent: "emerald",
    icon: ClipboardList,
  },
  {
    id: "cars2",
    abbr: "CARS-2",
    title: "Childhood Autism Rating Scale",
    subtitle: "Childhood Autism Rating Scale, Second Edition",
    description:
      "A widely-used standardised rating scale for assessing autism severity. The second edition includes separate forms for standard and high-functioning ranges, with a questionnaire form for parent input.",
    tags: ["International", "Severity rating", "2 forms"],
    accent: "amber",
    icon: BarChart3,
  },
];

// Accent palette map → Tailwind classes (avoids dynamic class generation issues)
const ACCENT_MAP = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    ring: "ring-blue-400 dark:ring-blue-600",
    selectedBg: "bg-blue-50/80 dark:bg-blue-950/50",
    selectedBorder: "border-blue-400 dark:border-blue-500",
    btn: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    ring: "ring-violet-400 dark:ring-violet-600",
    selectedBg: "bg-violet-50/80 dark:bg-violet-950/50",
    selectedBorder: "border-violet-400 dark:border-violet-500",
    btn: "bg-violet-600 hover:bg-violet-700 text-white",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    ring: "ring-emerald-400 dark:ring-emerald-600",
    selectedBg: "bg-emerald-50/80 dark:bg-emerald-950/50",
    selectedBorder: "border-emerald-400 dark:border-emerald-500",
    btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    ring: "ring-amber-400 dark:ring-amber-600",
    selectedBg: "bg-amber-50/80 dark:bg-amber-950/50",
    selectedBorder: "border-amber-400 dark:border-amber-500",
    btn: "bg-amber-500 hover:bg-amber-600 text-white",
  },
};

// ── "Others" request form ──────────────────────────────────────────────────────
function OtherRequestForm({ onClose }) {
  const [form, setForm] = useState({ institution: "", specialist: "", assessment: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);

  const handle = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // In the future this will POST to the backend
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-4 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Request Submitted!</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            We'll review your request for <span className="font-medium text-foreground">"{form.assessment}"</span> and get back to you.
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Institution */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Institution / Organisation <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            required
            value={form.institution}
            onChange={(e) => handle("institution", e.target.value)}
            placeholder="e.g. NIMHANS, AIIMS, Private Clinic"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      {/* Specialist Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Specialist Name <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            required
            value={form.specialist}
            onChange={(e) => handle("specialist", e.target.value)}
            placeholder="Your full name"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      {/* Assessment name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Assessment Tool Name <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            required
            value={form.assessment}
            onChange={(e) => handle("assessment", e.target.value)}
            placeholder="Full name of the assessment tool"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Additional Notes <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => handle("notes", e.target.value)}
            placeholder="Any context about the tool, population, or use-case…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
        >
          <Send className="w-4 h-4" />
          Submit Request
        </button>
      </div>
    </form>
  );
}

// ── Main Assessment Page ───────────────────────────────────────────────────────
export function AssessmentPage() {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get("studentId"); // may be null if navigated directly

  const [selected, setSelected] = useState(null); // id of chosen assessment
  const [showOtherForm, setShowOtherForm] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12 w-full max-w-5xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {studentId && (
            <NavLink
              to={`/students/${studentId}`}
              className="p-2 border border-border rounded-full hover:bg-accent hover:text-accent-foreground transition text-muted-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </NavLink>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              Assessment Tests
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {studentId
                ? "Select an assessment tool to administer for this student"
                : "Choose an assessment tool to get started"}
            </p>
          </div>
        </div>

        {/* Start button — active only when a tool is selected */}
        {selected && (
          <button
            className={`shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm animate-in fade-in duration-200 ${
              ACCENT_MAP[ASSESSMENTS.find((a) => a.id === selected)?.accent || "blue"].btn
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Start {ASSESSMENTS.find((a) => a.id === selected)?.abbr}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </header>

      {/* ── Assessment cards grid ────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          Available Assessment Tools
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ASSESSMENTS.map((assessment) => {
            const c = ACCENT_MAP[assessment.accent];
            const isSelected = selected === assessment.id;
            const Icon = assessment.icon;

            return (
              <button
                key={assessment.id}
                onClick={() => setSelected(isSelected ? null : assessment.id)}
                className={`group relative w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 focus:outline-none focus-visible:ring-2 ${c.ring} ${
                  isSelected
                    ? `${c.selectedBg} ${c.selectedBorder} shadow-md`
                    : `bg-card border-border hover:${c.border} hover:shadow-sm`
                }`}
              >
                {/* Selected check */}
                {isSelected && (
                  <div className="absolute top-4 right-4 animate-in zoom-in duration-150">
                    <CheckCircle2 className={`w-5 h-5 ${c.iconColor}`} />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${c.iconBg} transition-colors`}>
                    <Icon className={`w-6 h-6 ${c.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Abbr badge */}
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${c.badge}`}>
                      {assessment.abbr}
                    </span>

                    {/* Title */}
                    <h3 className="font-semibold text-foreground text-sm leading-snug mb-1.5 pr-6">
                      {assessment.subtitle}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                      {assessment.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {assessment.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {/* ── "Others" card ─────────────────────────────────────────────── */}
          <button
            onClick={() => setShowOtherForm(true)}
            className="group w-full text-left rounded-2xl border-2 border-dashed border-border hover:border-primary/40 bg-card hover:bg-primary/5 dark:hover:bg-primary/10 p-5 transition-all duration-200 focus:outline-none focus-visible:ring-2 ring-primary md:col-span-2"
          >
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-muted group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors">
                <PlusCircle className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Others
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-sm">
                  Request a Different Assessment Tool
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Don't see the tool you use? Submit a request and we'll add it.
                </p>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* ── Info strip ──────────────────────────────────────────────────────── */}
      {selected && (
        <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
          {(() => {
            const a = ASSESSMENTS.find((x) => x.id === selected);
            const c = ACCENT_MAP[a.accent];
            return (
              <div className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${c.iconBg}`}>
                    <a.icon className={`w-5 h-5 ${c.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${c.iconColor}`}>
                      Selected Tool
                    </p>
                    <h3 className="font-semibold text-foreground">{a.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {a.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="shrink-0 p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── "Others" modal ──────────────────────────────────────────────────── */}
      {showOtherForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setShowOtherForm(false); }}
        >
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-200">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground text-base">Request Assessment Tool</h2>
                  <p className="text-xs text-muted-foreground">We'll review and add it to the platform</p>
                </div>
              </div>
              <button
                onClick={() => setShowOtherForm(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5">
              <OtherRequestForm onClose={() => setShowOtherForm(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
