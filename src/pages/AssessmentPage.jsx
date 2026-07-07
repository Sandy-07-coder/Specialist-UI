import { useState } from "react";
import { useSearchParams, NavLink, useNavigate } from "react-router-dom";
import {
  ClipboardList, Brain, Microscope, BarChart3,
  Star, PlusCircle, ArrowLeft, ChevronRight,
  Lock, Building2, User, FileText, Send, CheckCircle2, X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ASSESSMENTS = [
  {
    id: "isaa", abbr: "ISAA", available: true,
    subtitle: "Indian Scale for Assessment of Autism",
    description: "A standardised 40-item scale developed for Indian children, covering Social, Emotional, Speech, Behavioural, Sensory, and Cognitive domains.",
    tags: ["India-specific", "Ages 2–9", "40 items"],
    accent: "blue", icon: Brain,
  },
  {
    id: "inclen", abbr: "INCLEN-INDT", available: false,
    subtitle: "INCLEN Diagnostic Tool for ASD",
    description: "A diagnostic tool validated for use in Indian settings by INCLEN, supporting early identification of Autism Spectrum Disorder.",
    tags: ["Diagnostic", "Validated India", "Multicenter"],
    accent: "violet", icon: Microscope,
  },
  {
    id: "iasq", abbr: "IASQ", available: false,
    subtitle: "Indian Autism Screening Questionnaire",
    description: "A rapid parent/caregiver-completed screening questionnaire for use in primary healthcare settings as an early triage tool.",
    tags: ["Screening", "Parent-report", "Primary Care"],
    accent: "emerald", icon: ClipboardList,
  },
  {
    id: "cars2", abbr: "CARS-2", available: false,
    subtitle: "Childhood Autism Rating Scale, Second Edition",
    description: "A widely-used standardised rating scale for assessing autism severity, with standard and high-functioning forms.",
    tags: ["International", "Severity rating", "2 forms"],
    accent: "amber", icon: BarChart3,
  },
];

const ACCENT = {
  blue:    { iconBg: "bg-blue-100 dark:bg-blue-900/40",   icon: "text-blue-600 dark:text-blue-400",   badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",   border: "border-blue-400", btn: "bg-blue-600 hover:bg-blue-700" },
  violet:  { iconBg: "bg-violet-100 dark:bg-violet-900/40", icon: "text-violet-600 dark:text-violet-400", badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300", border: "border-violet-400", btn: "bg-violet-600 hover:bg-violet-700" },
  emerald: { iconBg: "bg-emerald-100 dark:bg-emerald-900/40", icon: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", border: "border-emerald-400", btn: "bg-emerald-600 hover:bg-emerald-700" },
  amber:   { iconBg: "bg-amber-100 dark:bg-amber-900/40",  icon: "text-amber-600 dark:text-amber-400",  badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",  border: "border-amber-400", btn: "bg-amber-500 hover:bg-amber-600" },
};

function OtherRequestForm({ onClose }) {
  const [form, setForm] = useState({ institution: "", specialist: "", assessment: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const h = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (submitted) return (
    <div className="flex flex-col items-center py-10 text-center gap-4 animate-in fade-in duration-200">
      <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
        <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">Request Submitted!</h3>
        <p className="text-sm text-muted-foreground mt-1">We'll review your request for <b>"{form.assessment}"</b> and get back to you.</p>
      </div>
      <button onClick={onClose} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors">Done</button>
    </div>
  );

  const Field = ({ label, icon: Icon, field, type = "text", placeholder, rows }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label} <span className="text-destructive">*</span></label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" style={rows ? { top: "12px", transform: "none" } : {}} />
        {rows
          ? <textarea rows={rows} required value={form[field]} onChange={e => h(field, e.target.value)} placeholder={placeholder} className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          : <input type={type} required value={form[field]} onChange={e => h(field, e.target.value)} placeholder={placeholder} className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
        }
      </div>
    </div>
  );

  return (
    <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
      <Field label="Institution / Organisation" icon={Building2} field="institution" placeholder="e.g. NIMHANS, AIIMS" />
      <Field label="Specialist Name" icon={User} field="specialist" placeholder="Your full name" />
      <Field label="Assessment Tool Name" icon={ClipboardList} field="assessment" placeholder="Full name of the tool" />
      <Field label="Notes (optional)" icon={FileText} field="notes" placeholder="Context about the tool…" rows={3} />
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
        <button type="submit" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors">
          <Send className="w-4 h-4" /> Submit Request
        </button>
      </div>
    </form>
  );
}

export function AssessmentPage() {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get("studentId");
  const navigate = useNavigate();
  const [showOther, setShowOther] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12 w-full max-w-5xl mx-auto">
      <header className="flex items-center gap-4">
        {studentId && (
          <NavLink to={`/students/${studentId}`} className="p-2 border border-border rounded-full hover:bg-accent transition text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </NavLink>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Assessment Tests</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Select an assessment tool to administer</p>
        </div>
      </header>

      <section>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Available Assessment Tools</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ASSESSMENTS.map(a => {
            const c = ACCENT[a.accent];
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                disabled={!a.available}
                onClick={() => a.available && navigate(`/assessment/isaa${studentId ? `?studentId=${studentId}` : ""}`)}
                className={`relative group w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 focus:outline-none
                  ${a.available
                    ? `bg-card border-border hover:${c.border} hover:shadow-md cursor-pointer focus-visible:ring-2 ring-offset-2`
                    : "bg-muted/40 border-border/50 opacity-60 cursor-not-allowed"}`}
              >
                {!a.available && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-muted border border-border rounded-full px-2 py-0.5">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] font-medium text-muted-foreground">Unavailable</span>
                  </div>
                )}
                {a.available && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className={`w-5 h-5 ${c.icon}`} />
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${c.iconBg}`}>
                    <Icon className={`w-6 h-6 ${c.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${c.badge}`}>{a.abbr}</span>
                    <h3 className="font-semibold text-foreground text-sm leading-snug mb-1.5 pr-6">{a.subtitle}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{a.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {a.tags.map(t => (
                        <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {/* Others card */}
          <button
            onClick={() => setShowOther(true)}
            className="group w-full text-left rounded-2xl border-2 border-dashed border-border hover:border-primary/40 bg-card hover:bg-primary/5 p-5 transition-all duration-200 md:col-span-2"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted group-hover:bg-primary/10 transition-colors">
                <PlusCircle className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Others</span>
                </div>
                <h3 className="font-semibold text-foreground text-sm">Request a Different Assessment Tool</h3>
                <p className="text-xs text-muted-foreground mt-1">Don't see the tool you use? Submit a request and we'll add it.</p>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Others modal */}
      {showOther && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={e => e.target === e.currentTarget && setShowOther(false)}>
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Request Assessment Tool</h2>
                  <p className="text-xs text-muted-foreground">We'll review and add it to the platform</p>
                </div>
              </div>
              <button onClick={() => setShowOther(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5">
              <OtherRequestForm onClose={() => setShowOther(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
