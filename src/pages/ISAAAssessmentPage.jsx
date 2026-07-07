import { useState, useEffect } from "react";
import { useSearchParams, NavLink } from "react-router-dom";
import {
  ArrowLeft, ChevronRight, ChevronLeft, BookOpen, ClipboardList,
  Trophy, AlertTriangle, CheckCircle2, Info, Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import isaaData from "@/assets/isaa_assessment_details.json";
import { useStudentStore } from "@/store/useStudentStore";
import { useAuthStore } from "@/store";

const OPTIONS = isaaData.scoring_guidelines.options;
const DOMAINS = isaaData.domains;
const LABELS  = { 1:"Rarely", 2:"Sometimes", 3:"Frequently", 4:"Mostly", 5:"Always" };
const PCT     = { 1:"0–20%", 2:"21–40%", 3:"41–60%", 4:"61–80%", 5:"81–100%" };
const TOTAL   = DOMAINS.reduce((s, d) => s + d.items.length, 0); // 40

function classify(n) {
  if (n < 70)  return { label:"No Autism",       color:"emerald", range:"< 70" };
  if (n <= 106) return { label:"Mild Autism",     color:"amber",   range:"70–106" };
  if (n <= 153) return { label:"Moderate Autism", color:"orange",  range:"107–153" };
  return              { label:"Severe Autism",    color:"red",     range:"> 153" };
}

function dobToInput(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toISOString().split("T")[0]; // yyyy-mm-dd for <input type="date">
}
function ageFromDob(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString), t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  if (t.getMonth() - d.getMonth() < 0 || (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())) a--;
  return `${a} years`;
}

// ── Phase 1 ──────────────────────────────────────────────────────────────────
function Instructions({ onNext }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="pt-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">Indian Scale for Assessment of Autism (ISAA)</h2>
              <p className="text-sm text-muted-foreground mt-1">National Institute for the Mentally Handicapped · Govt. of India</p>
              <p className="text-xs text-muted-foreground">ISO 9001:2000 · Manovikas Nagar, Secunderabad</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {[
        { n:"1", title:"How it is Done", body:"A trained clinician takes 45–60 minutes using:\n• Direct observation of behaviours.\n• Interaction (tasks, communication testing).\n• An interview with the parent/caregiver." },
        { n:"2", title:"The 40-Item Scoring System", body:"Rate 40 behaviours across 6 domains (Social, Emotional, Speech, Behavioural, Sensory, Cognitive) on a 1–5 scale:\n• 1 (Rarely): 0–20%\n• 2 (Sometimes): 21–40%\n• 3 (Frequently): 41–60%\n• 4 (Mostly): 61–80%\n• 5 (Always): 81–100%" },
        { n:"3", title:"Understanding the Results", body:"Scores summed (Min 40, Max 200):\n• Below 70 → No Autism\n• 70–106 → Mild Autism\n• 107–153 → Moderate Autism\n• Above 153 → Severe Autism" },
      ].map(s => (
        <div key={s.n} className="flex gap-4 p-5 rounded-2xl border border-border bg-card">
          <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{s.n}</div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{s.body}</p>
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4"><Info className="w-4 h-4 text-muted-foreground" /><h3 className="font-semibold text-foreground text-sm">Scoring Reference</h3></div>
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
          Start Assessment <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Phase 2 ──────────────────────────────────────────────────────────────────
function AssessmentForm({ student, onComplete }) {
  const today = new Date().toISOString().split("T")[0];
  const [patient, setPatient] = useState({
    name:     student?.name     || "",
    gender:   student?.gender   || "",
    age:      student ? ageFromDob(student.dob) : "",
    dob:      student ? dobToInput(student.dob) : "",
    examiner: "",
    date:     today,
  });
  const [scores, setScores]           = useState({});
  const [activeDomain, setActiveDomain] = useState(0);
  const [error, setError]             = useState("");

  const answered = Object.keys(scores).length;
  const progress  = Math.round((answered / TOTAL) * 100);
  const domain    = DOMAINS[activeDomain];

  const set = (k, v) => setPatient(p => ({ ...p, [k]: v }));
  const inp = "w-full px-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors";

  const handleSubmit = () => {
    if (!patient.name.trim() || !patient.examiner.trim()) {
      setError("Please fill Child's Name and Examiner before submitting.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (answered < TOTAL) {
      setError(`Please rate all 40 items. ${TOTAL - answered} remaining.`);
      return;
    }
    setError("");
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    onComplete({ patient, scores, total });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Progress */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm font-bold text-primary">{answered} / {TOTAL}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width:`${progress}%` }} />
        </div>
      </div>

      {/* Patient info */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base flex items-center gap-2"><ClipboardList className="w-4 h-4 text-muted-foreground" />Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          {error && <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}
          {student && <p className="mb-4 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">✓ Pre-filled from student record</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { k:"name",     l:"Name of the Child *", t:"text", p:"Full name" },
              { k:"gender",   l:"Gender",               t:"text", p:"e.g. Male / Female" },
              { k:"age",      l:"Age",                  t:"text", p:"e.g. 5 years" },
              { k:"dob",      l:"D.O.B",                t:"date", p:"" },
              { k:"examiner", l:"Examiner *",           t:"text", p:"Clinician name" },
              { k:"date",     l:"Date",                 t:"date", p:"" },
            ].map(f => (
              <div key={f.k}>
                <label className="block text-sm font-medium text-foreground mb-1.5">{f.l}</label>
                <input type={f.t} value={patient[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.p} className={inp} />
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
              Domain {d.domain_id}
            </button>
          );
        })}
      </div>

      {/* Items */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base">Domain {domain.domain_id}: {domain.domain_name}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Rate 1 (Rarely) → 5 (Always)</p>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          {domain.items.map(item => {
            const sel = scores[item.item_number];
            return (
              <div key={item.item_number} className={`p-4 rounded-xl border transition-colors ${sel ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-muted-foreground">{item.item_number}</span>
                  <p className="text-sm font-medium text-foreground pt-1">{item.statement}</p>
                </div>
                <div className="grid grid-cols-5 gap-2 ml-10">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} type="button" onClick={() => setScores(p => ({ ...p, [item.item_number]: v }))}
                      className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all text-center ${
                        sel === v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50 text-foreground"
                      }`}>
                      <span className="text-base font-bold leading-none">{v}</span>
                      <span className="text-[9px] mt-1 hidden sm:block">{LABELS[v]}</span>
                    </button>
                  ))}
                </div>
                {sel && <p className="text-xs text-muted-foreground ml-10 mt-2">Selected: <span className="font-semibold text-primary">{LABELS[sel]}</span> — {PCT[sel]}</p>}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <button onClick={() => setActiveDomain(p => Math.max(0, p-1))} disabled={activeDomain === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40">
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        {activeDomain < DOMAINS.length - 1
          ? <button onClick={() => setActiveDomain(p => p+1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
              Next Domain <ChevronRight className="w-4 h-4" />
            </button>
          : <button onClick={handleSubmit} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors">
              <Trophy className="w-4 h-4" /> Submit Assessment
            </button>
        }
      </div>
    </div>
  );
}

// ── Phase 3 ──────────────────────────────────────────────────────────────────
const COLOR = {
  emerald: { ring:"ring-emerald-400", bg:"bg-emerald-50 dark:bg-emerald-900/20", border:"border-emerald-300 dark:border-emerald-700", text:"text-emerald-700 dark:text-emerald-300", icon:"text-emerald-500" },
  amber:   { ring:"ring-amber-400",   bg:"bg-amber-50 dark:bg-amber-900/20",     border:"border-amber-300 dark:border-amber-700",     text:"text-amber-700 dark:text-amber-300",   icon:"text-amber-500" },
  orange:  { ring:"ring-orange-400",  bg:"bg-orange-50 dark:bg-orange-900/20",   border:"border-orange-300 dark:border-orange-700",   text:"text-orange-700 dark:text-orange-300", icon:"text-orange-500" },
  red:     { ring:"ring-red-400",     bg:"bg-red-50 dark:bg-red-900/20",         border:"border-red-300 dark:border-red-700",         text:"text-red-700 dark:text-red-300",       icon:"text-red-500" },
};

function Results({ result, saving, saveError, onRestart, studentId }) {
  const { patient, scores, total } = result;
  const cls = classify(total);
  const c   = COLOR[cls.color];
  const domainScores = DOMAINS.map(d => ({
    id: d.domain_id, name: d.domain_name,
    score: d.items.reduce((s, it) => s + (scores[it.item_number] || 0), 0),
    max: d.items.length * 5,
  }));

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {saving && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
          <Loader2 className="w-4 h-4 animate-spin" /> Saving results to student record…
        </div>
      )}
      {saveError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {saveError}
        </div>
      )}
      {!saving && !saveError && studentId && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> Results saved to student record successfully.
        </div>
      )}

      {/* Score card */}
      <div className={`rounded-2xl border-2 ${c.border} ${c.bg} p-6 text-center`}>
        <div className={`inline-flex w-20 h-20 rounded-full ring-4 ${c.ring} bg-white dark:bg-gray-900 items-center justify-center mb-4`}>
          <span className={`text-2xl font-black ${c.text}`}>{total}</span>
        </div>
        <h2 className={`text-2xl font-black ${c.text}`}>{cls.label}</h2>
        <p className="text-sm text-muted-foreground mt-1">Score range: {cls.range} · Max: 200</p>
        <div className="mt-3 space-y-0.5">
          {patient.name && <p className="text-sm font-medium text-foreground">Child: <span className="font-semibold">{patient.name}</span></p>}
          {patient.examiner && <p className="text-sm text-muted-foreground">Examiner: {patient.examiner}</p>}
          <p className="text-xs text-muted-foreground">Test: ISAA</p>
        </div>
      </div>

      {/* Severity scale */}
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Severity Scale</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-2">
          {[
            { label:"No Autism",       range:"< 70",    color:"emerald" },
            { label:"Mild Autism",     range:"70–106",  color:"amber" },
            { label:"Moderate Autism", range:"107–153", color:"orange" },
            { label:"Severe Autism",   range:"> 153",   color:"red" },
          ].map(s => {
            const sc = COLOR[s.color], active = s.label === cls.label;
            return (
              <div key={s.label} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${active ? `${sc.border} ${sc.bg} font-bold` : "border-border"}`}>
                <div className="flex items-center gap-2">
                  {active && <CheckCircle2 className={`w-4 h-4 ${sc.icon}`} />}
                  <span className={`text-sm ${active ? sc.text : "text-muted-foreground"}`}>{s.label}</span>
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
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Domain Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {domainScores.map(d => (
            <div key={d.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-foreground">{d.id}. {d.name.replace(/ AND /i, " & ")}</span>
                <span className="font-mono text-muted-foreground">{d.score} / {d.max}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width:`${Math.round((d.score/d.max)*100)}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <button onClick={onRestart} className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">New Assessment</button>
        <NavLink to={studentId ? `/students/${studentId}` : "/students"} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold transition-colors">
          {studentId ? "Back to Student" : "Back to Students"} <ChevronRight className="w-4 h-4" />
        </NavLink>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export function ISAAAssessmentPage() {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get("studentId");
  const { token } = useAuthStore();
  const { currentStudent, isLoadingOne, fetchStudentById, saveAssessmentResult } = useStudentStore();

  const [phase,    setPhase]    = useState("instructions");
  const [result,   setResult]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (studentId && token) fetchStudentById(token, studentId);
  }, [studentId, token, fetchStudentById]);

  const phaseIdx = ["instructions","assessment","results"].indexOf(phase);

  const handleComplete = async (r) => {
    setResult(r);
    setPhase("results");
    if (studentId) {
      setSaving(true);
      setSaveError("");
      const cls = classify(r.total);
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
      <div className="flex items-center gap-3">
        <NavLink to={`/assessment${studentId ? `?studentId=${studentId}` : ""}`}
          className="p-2 border border-border rounded-full hover:bg-accent transition text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </NavLink>
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">ISAA</h1>
          <p className="text-xs text-muted-foreground">Indian Scale for Assessment of Autism
            {student && <span className="ml-2 font-medium text-foreground">· {student.name}</span>}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 flex-wrap">
        {["Instructions","Assessment","Results"].map((l, i) => {
          const done = i < phaseIdx, active = i === phaseIdx;
          return (
            <div key={l} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${active ? "bg-primary text-primary-foreground" : done ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{i+1}</span>} {l}
              </div>
              {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
          );
        })}
      </div>

      {/* Loading student */}
      {isLoadingOne && studentId && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading student info…
        </div>
      )}

      {phase === "instructions" && <Instructions onNext={() => setPhase("assessment")} />}
      {phase === "assessment"   && <AssessmentForm student={student} onComplete={handleComplete} />}
      {phase === "results" && result && (
        <Results result={result} saving={saving} saveError={saveError}
          onRestart={() => { setResult(null); setPhase("instructions"); setSaveError(""); }}
          studentId={studentId} />
      )}
    </div>
  );
}
