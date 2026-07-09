import { useState, useEffect } from "react";
import { useSearchParams, NavLink } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, ChevronLeft, BookOpen, ClipboardList,
  Trophy, AlertTriangle, CheckCircle2, Info, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import isaaData from "@/assets/isaa_assessment_details.json";
import { useStudentStore } from "@/store/useStudentStore";
import { useAuthStore } from "@/store";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const OPTIONS = isaaData.scoring_guidelines.options;
const DOMAINS = isaaData.domains;
const TOTAL   = DOMAINS.reduce((s, d) => s + d.items.length, 0); // 40

function classify(n, t) {
  if (n < 70)   return { label: t("isaa.results.classify.noAutism"),       color: "emerald", range: "< 70" };
  if (n <= 106) return { label: t("isaa.results.classify.mildAutism"),     color: "amber",   range: "70–106" };
  if (n <= 153) return { label: t("isaa.results.classify.moderateAutism"), color: "orange",  range: "107–153" };
  return              { label: t("isaa.results.classify.severeAutism"),    color: "red",     range: "> 153" };
}

function dobToInput(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toISOString().split("T")[0];
}
function ageFromDob(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString), now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  if (now.getMonth() - d.getMonth() < 0 || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) a--;
  return `${a} years`;
}

// ── Phase 1: Instructions ─────────────────────────────────────────────────────
function Instructions({ onNext }) {
  const { t } = useTranslation();
  const steps = t("isaa.instructions.steps", { returnObjects: true });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="pt-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">{t("isaa.instructions.heading")}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t("isaa.instructions.institute")}</p>
              <p className="text-xs text-muted-foreground">{t("isaa.instructions.address")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {Array.isArray(steps) && steps.map((s, i) => (
        <div key={i} className="flex gap-4 p-5 rounded-2xl border border-border bg-card">
          <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {i + 1}
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{s.body}</p>
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-semibold text-foreground text-sm">{t("isaa.instructions.scoringReference")}</h3>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {OPTIONS.map(o => (
            <div key={o.score} className="text-center p-2 rounded-xl bg-muted border border-border">
              <div className="text-lg font-bold text-foreground">{o.score}</div>
              <div className="text-xs font-medium text-foreground">{o.label}</div>
              <div className="text-[10px] text-muted-foreground">{o.percentage}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onNext} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
          {t("isaa.instructions.startAssessment")} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Phase 2: Assessment form ───────────────────────────────────────────────────
function AssessmentForm({ student, onComplete }) {
  const { t } = useTranslation();
  const today = new Date().toISOString().split("T")[0];
  const [patient, setPatient] = useState({
    name:     student?.name     || "",
    gender:   student?.gender   || "",
    age:      student ? ageFromDob(student.dob) : "",
    dob:      student ? dobToInput(student.dob) : "",
    examiner: "",
    date:     today,
  });
  const [scores, setScores]             = useState({});
  const [activeDomain, setActiveDomain] = useState(0);
  const [error, setError]               = useState("");

  const answered = Object.keys(scores).length;
  const progress  = Math.round((answered / TOTAL) * 100);
  const domain    = DOMAINS[activeDomain];

  const set = (k, v) => setPatient(p => ({ ...p, [k]: v }));
  const inp = "w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors";

  const handleSubmit = () => {
    if (!patient.name.trim() || !patient.examiner.trim()) {
      setError(t("isaa.form.errorFillRequired"));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (answered < TOTAL) {
      setError(t("isaa.form.errorRateAll", { remaining: TOTAL - answered }));
      return;
    }
    setError("");
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    onComplete({ patient, scores, total });
  };

  const fields = [
    { k: "name",     l: t("isaa.form.fields.name"),     type: "text", p: t("isaa.form.fields.namePlaceholder") },
    { k: "gender",   l: t("isaa.form.fields.gender"),   type: "text", p: t("isaa.form.fields.genderPlaceholder") },
    { k: "age",      l: t("isaa.form.fields.age"),      type: "text", p: t("isaa.form.fields.agePlaceholder") },
    { k: "dob",      l: t("isaa.form.fields.dob"),      type: "date", p: "" },
    { k: "examiner", l: t("isaa.form.fields.examiner"), type: "text", p: t("isaa.form.fields.examinerPlaceholder") },
    { k: "date",     l: t("isaa.form.fields.date"),     type: "date", p: "" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Progress */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-foreground">{t("isaa.form.progress")}</span>
          <span className="text-sm font-bold text-primary">{answered} / {TOTAL}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Patient info */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-muted-foreground" />
            {t("isaa.form.patientInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          {student && (
            <p className="mb-4 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
              {t("isaa.form.prefilled")}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.k}>
                <label className="block text-sm font-medium text-foreground mb-1.5">{f.l}</label>
                <input type={f.type} value={patient[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.p} className={inp} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Domain tabs */}
      <div className="flex flex-wrap gap-2">
        {DOMAINS.map((d, i) => {
          const done = d.items.every(it => scores[it.item_number] !== undefined);
          return (
            <button key={d.domain_id} onClick={() => setActiveDomain(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                i === activeDomain ? "bg-primary text-primary-foreground border-primary"
                : done ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700"
                : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}>
              {done && i !== activeDomain && <CheckCircle2 className="inline w-3 h-3 mr-1" />}
              {t("isaa.form.domain")} {d.domain_id}
            </button>
          );
        })}
      </div>

      {/* Items */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base">{t("isaa.form.domain")} {domain.domain_id}: {domain.domain_name}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">{t("isaa.form.rateScale")}</p>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          {domain.items.map(item => {
            const sel = scores[item.item_number];
            return (
              <div key={item.item_number} className={`p-4 rounded-xl border transition-colors ${sel ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {item.item_number}
                  </span>
                  <p className="text-sm font-medium text-foreground pt-1">{item.statement}</p>
                </div>
                <div className="grid grid-cols-5 gap-2 ml-10">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} type="button" onClick={() => setScores(p => ({ ...p, [item.item_number]: v }))}
                      className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all text-center ${
                        sel === v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50 text-foreground"
                      }`}>
                      <span className="text-base font-bold leading-none">{v}</span>
                      <span className="text-[9px] mt-1 hidden sm:block">{t(`isaa.form.scoreLabels.${v}`)}</span>
                    </button>
                  ))}
                </div>
                {sel && (
                  <p className="text-xs text-muted-foreground ml-10 mt-2">
                    {t("isaa.form.selected")}: <span className="font-semibold text-primary">{t(`isaa.form.scoreLabels.${sel}`)}</span> — {t(`isaa.form.scorePct.${sel}`)}
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <button onClick={() => setActiveDomain(p => Math.max(0, p - 1))} disabled={activeDomain === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40">
          <ChevronLeft className="w-4 h-4" /> {t("isaa.form.previous")}
        </button>
        {activeDomain < DOMAINS.length - 1
          ? <button onClick={() => setActiveDomain(p => p + 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
              {t("isaa.form.nextDomain")} <ChevronRight className="w-4 h-4" />
            </button>
          : <button onClick={handleSubmit} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors">
              <Trophy className="w-4 h-4" /> {t("isaa.form.submitAssessment")}
            </button>
        }
      </div>
    </div>
  );
}

// ── Phase 3: Results ──────────────────────────────────────────────────────────
const COLOR = {
  emerald: { ring: "ring-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-300 dark:border-emerald-700", text: "text-emerald-700 dark:text-emerald-300", icon: "text-emerald-500" },
  amber:   { ring: "ring-amber-400",   bg: "bg-amber-50 dark:bg-amber-900/20",     border: "border-amber-300 dark:border-amber-700",     text: "text-amber-700 dark:text-amber-300",   icon: "text-amber-500" },
  orange:  { ring: "ring-orange-400",  bg: "bg-orange-50 dark:bg-orange-900/20",   border: "border-orange-300 dark:border-orange-700",   text: "text-orange-700 dark:text-orange-300", icon: "text-orange-500" },
  red:     { ring: "ring-red-400",     bg: "bg-red-50 dark:bg-red-900/20",         border: "border-red-300 dark:border-red-700",         text: "text-red-700 dark:text-red-300",       icon: "text-red-500" },
};

function Results({ result, saving, saveError, onRestart, studentId }) {
  const { t } = useTranslation();
  const { patient, scores, total } = result;
  const cls = classify(total, t);
  const c   = COLOR[cls.color];

  const domainScores = DOMAINS.map(d => ({
    id: d.domain_id, name: d.domain_name,
    score: d.items.reduce((s, it) => s + (scores[it.item_number] || 0), 0),
    max: d.items.length * 5,
  }));

  const severityRows = [
    { key: "noAutism",       range: "< 70",    color: "emerald" },
    { key: "mildAutism",     range: "70–106",  color: "amber" },
    { key: "moderateAutism", range: "107–153", color: "orange" },
    { key: "severeAutism",   range: "> 153",   color: "red" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {saving && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
          <Loader2 className="w-4 h-4 animate-spin" /> {t("isaa.results.savingResults")}
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {saveError}
        </div>
      )}
      {!saving && !saveError && studentId && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {t("isaa.results.savedSuccess")}
        </div>
      )}

      {/* Score card */}
      <div className={`rounded-2xl border-2 ${c.border} ${c.bg} p-6 text-center`}>
        <div className={`inline-flex w-20 h-20 rounded-full ring-4 ${c.ring} bg-white dark:bg-gray-900 items-center justify-center mb-4`}>
          <span className={`text-2xl font-black ${c.text}`}>{total}</span>
        </div>
        <h2 className={`text-2xl font-black ${c.text}`}>{cls.label}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("isaa.results.scoreRange", { range: cls.range })}</p>
        <div className="mt-3 space-y-0.5">
          {patient.name     && <p className="text-sm font-medium text-foreground">{t("isaa.results.child")}: <span className="font-semibold">{patient.name}</span></p>}
          {patient.examiner && <p className="text-sm text-muted-foreground">{t("isaa.results.examiner")}: {patient.examiner}</p>}
          <p className="text-xs text-muted-foreground">{t("isaa.results.test")}: ISAA</p>
        </div>
      </div>

      {/* Severity scale */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t("isaa.results.severityScale")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-2">
          {severityRows.map(s => {
            const sc = COLOR[s.color];
            const active = t(`isaa.results.classify.${s.key}`) === cls.label;
            return (
              <div key={s.key} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${active ? `${sc.border} ${sc.bg} font-bold` : "border-border"}`}>
                <div className="flex items-center gap-2">
                  {active && <CheckCircle2 className={`w-4 h-4 ${sc.icon}`} />}
                  <span className={`text-sm ${active ? sc.text : "text-muted-foreground"}`}>
                    {t(`isaa.results.classify.${s.key}`)}
                  </span>
                </div>
                <span className={`text-xs font-mono ${active ? sc.text : "text-muted-foreground"}`}>{s.range}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Domain breakdown */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t("isaa.results.domainBreakdown")}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {domainScores.map(d => (
            <div key={d.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-foreground">{d.id}. {d.name.replace(/ AND /i, " & ")}</span>
                <span className="font-mono text-muted-foreground">{d.score} / {d.max}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.round((d.score / d.max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <button onClick={onRestart} className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
          {t("isaa.results.newAssessment")}
        </button>
        <NavLink to={studentId ? `/students/${studentId}` : "/students"} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold transition-colors">
          {studentId ? t("isaa.results.backToStudent") : t("isaa.results.backToStudents")} <ChevronRight className="w-4 h-4" />
        </NavLink>
      </div>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export function ISAAAssessmentPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get("studentId");
  const { token } = useAuthStore();
  const { currentStudent, isLoadingOne, fetchStudentById, saveAssessmentResult } = useStudentStore();

  const [phase,     setPhase]     = useState("instructions");
  const [result,    setResult]    = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (studentId && token) fetchStudentById(token, studentId);
  }, [studentId, token, fetchStudentById]);

  const phaseIdx = ["instructions", "assessment", "results"].indexOf(phase);
  const stepLabels = [
    t("isaa.stepInstructions"),
    t("isaa.stepAssessment"),
    t("isaa.stepResults"),
  ];

  const handleComplete = async (r) => {
    setResult(r);
    setPhase("results");
    if (studentId) {
      setSaving(true);
      setSaveError("");
      const cls = classify(r.total, t);
      const res = await saveAssessmentResult(token, studentId, {
        assessmentType:     "ISAA",
        assessmentScore:    r.total,
        assessmentSeverity: cls.label,
      });
      setSaving(false);
      if (!res.success) setSaveError(res.error || "Failed to save results. Please try again.");
    }
  };

  const student = studentId ? currentStudent : null;

  return (
    <div className="pb-12 w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <NavLink
            to={`/assessment${studentId ? `?studentId=${studentId}` : ""}`}
            className="p-2 border border-border rounded-full hover:bg-accent transition text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </NavLink>
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">{t("isaa.title")}</h1>
            <p className="text-xs text-muted-foreground">
              {t("isaa.subtitle")}
              {student && <span className="ml-2 font-medium text-foreground">· {student.name}</span>}
            </p>
          </div>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 flex-wrap">
        {stepLabels.map((label, i) => {
          const done = i < phaseIdx, active = i === phaseIdx;
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                active ? "bg-primary text-primary-foreground"
                : done  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                :         "bg-muted text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{i + 1}</span>} {label}
              </div>
              {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
          );
        })}
      </div>

      {/* Loading student */}
      {isLoadingOne && studentId && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> {t("isaa.loadingStudent")}
        </div>
      )}

      {phase === "instructions" && <Instructions onNext={() => setPhase("assessment")} />}
      {phase === "assessment"   && <AssessmentForm student={student} onComplete={handleComplete} />}
      {phase === "results" && result && (
        <Results
          result={result}
          saving={saving}
          saveError={saveError}
          onRestart={() => { setResult(null); setPhase("instructions"); setSaveError(""); }}
          studentId={studentId}
        />
      )}
    </div>
  );
}
