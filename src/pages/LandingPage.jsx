import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Brain, BarChart2, CheckCircle2, ArrowRight, Play,
  ClipboardList, Sparkles, ShieldCheck, ChevronRight,
  Star, Menu, X, Zap, Users, Activity
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = ["Features", "How It Works", "Demo", "Testimonials"];

const FEATURES = [
  {
    icon: <ClipboardList className="w-6 h-6 text-sky-600" />,
    bg: "bg-sky-50",
    title: "Custom Task Allocation",
    desc: "Build and assign neurodivergent-aware cognitive tasks tailored precisely to each child's therapeutic profile and progress stage.",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-amber-500" />,
    bg: "bg-amber-50",
    title: "Child-Friendly Execution",
    desc: "Distraction-free, intuitive interfaces designed with developmental psychology to keep children engaged without cognitive overload.",
  },
  {
    icon: <BarChart2 className="w-6 h-6 text-emerald-600" />,
    bg: "bg-emerald-50",
    title: "Real-Time Progress Tracking",
    desc: "Live compliance metrics, milestone dashboards, and session-ready reports stream directly to your clinical workspace.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
    bg: "bg-indigo-50",
    title: "HIPAA-Compliant & Secure",
    desc: "End-to-end encrypted data handling and role-based access controls built for regulated clinical environments.",
  },
];

const STEPS = [
  {
    num: "01",
    color: "text-sky-600",
    ring: "ring-sky-200",
    bg: "bg-sky-50",
    title: "Specialist Assesses & Assigns",
    desc: "The clinician reviews the child's profile, selects evidence-based tasks, and schedules them with a single click.",
    icon: <Brain className="w-5 h-5 text-sky-600" />,
  },
  {
    num: "02",
    color: "text-amber-500",
    ring: "ring-amber-200",
    bg: "bg-amber-50",
    title: "Child Completes Their Mission",
    desc: "The child opens their safe, focused portal and works through each task in a calm, gamified-yet-minimal interface.",
    icon: <Zap className="w-5 h-5 text-amber-500" />,
  },
  {
    num: "03",
    color: "text-emerald-600",
    ring: "ring-emerald-200",
    bg: "bg-emerald-50",
    title: "Data Returns to the Clinic",
    desc: "Completion rates, timing, and behavioural signals flow to the specialist's dashboard — ready for the next session.",
    icon: <Activity className="w-5 h-5 text-emerald-600" />,
  },
];

const SPECIALIST_TASKS = [
  { name: "Visual Focus Grid", category: "Attention", patient: "Ethan M.", status: "Assigned" },
  { name: "Sequential Memory Relay", category: "Working Memory", patient: "Aria K.", status: "In Progress" },
  { name: "Emotional Regulation Cue Cards", category: "Behavioural", patient: "Leo T.", status: "Pending" },
];

const TESTIMONIALS = [
  {
    quote: "RePaIR has transformed how I structure between-session tasks. The data I receive before each appointment has genuinely elevated the quality of my clinical decisions.",
    name: "Dr. Sarah Chen",
    role: "Pediatric Neurologist, Boston Children's Clinic",
    initials: "SC",
  },
  {
    quote: "My ADHD patients actually complete their exercises now. The child portal is calm enough to not overwhelm them, yet engaging enough to sustain focus.",
    name: "Marcus Webb",
    role: "Occupational Therapist, NYC Therapy Associates",
    initials: "MW",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar({ mobileOpen, setMobileOpen }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">
            Re<span className="text-indigo-600">PaIR</span>
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              {l}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
          <Link to="/register"
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
            Provider Portal <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-slate-500">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
          {NAV_LINKS.map((l) => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-slate-600 py-1">
              {l}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/login" className="text-sm font-medium text-slate-600 py-1">Sign In</Link>
            <Link to="/register"
              className="inline-flex justify-center items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg">
              Provider Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Designed for Neurodivergent Care
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
            Structured Therapeutic Tasks.{" "}
            <span className="text-indigo-600">Measurable Progress.</span>
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
            RePaIR empowers occupational therapists, pediatric neurologists, and ADHD/Autism specialists to assign tailored cognitive exercises — and track every milestone in real time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="#demo"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-md shadow-indigo-100">
              <Play className="w-4 h-4" /> Watch 2-Min Overview
            </a>
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-6 py-3 rounded-xl border border-slate-200 transition-colors">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-6">
            {[["500+", "Clinicians"], ["12k+", "Tasks Completed"], ["98%", "Compliance Rate"]].map(([v, l]) => (
              <div key={l}>
                <p className="text-xl font-bold text-slate-900">{v}</p>
                <p className="text-xs text-slate-400 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Dashboard mockup */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-sky-50 rounded-3xl -z-10" />
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-5 m-2">
            {/* Mockup header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Specialist Dashboard</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">Assigning Task to Patient</p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full">● Live</span>
            </div>

            {/* Task assignment card */}
            <div className="bg-indigo-50 rounded-xl p-4 mb-3 border border-indigo-100">
              <p className="text-xs text-indigo-400 font-medium mb-1">Currently Assigning</p>
              <p className="font-bold text-slate-900">Visual Focus Grid</p>
              <p className="text-sm text-slate-500 mt-0.5">→ Ethan M. · Session 7 · ADHD Profile</p>
            </div>

            {/* Mini metric bars */}
            <div className="space-y-2.5">
              {[["Attention Span", "72%", "bg-sky-400"], ["Task Completion", "89%", "bg-emerald-400"], ["Engagement Score", "64%", "bg-amber-400"]].map(([label, val, color]) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{label}</span><span className="font-semibold text-slate-700">{val}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: val }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Assign button */}
            <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
              Assign Task to Patient →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Core Capabilities</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Built for Clinical Excellence</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">Every feature is designed around the realities of specialist-led, child-centred therapeutic practice.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className={`w-11 h-11 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>{f.icon}</div>
              <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">The Workflow</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">How It Works</h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">A seamless three-step loop that closes the gap between clinic and home.</p>
        </div>
        <div className="relative grid md:grid-cols-3 gap-8">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-sky-200 via-amber-200 to-emerald-200" />

          {STEPS.map((s) => (
            <div key={s.num} className="flex flex-col items-center text-center">
              <div className={`relative w-24 h-24 ${s.bg} ring-4 ${s.ring} rounded-2xl flex flex-col items-center justify-center mb-5 shadow-sm`}>
                <span className={`text-xs font-black ${s.color} mb-1`}>{s.num}</span>
                {s.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  const [tab, setTab] = useState("specialist");
  const [checked, setChecked] = useState(false);

  return (
    <section id="demo" className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Interactive Preview</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Two Portals. One Mission.</h2>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 gap-1 shadow-sm">
            {[["specialist", <Users className="w-4 h-4" />, "Specialist View"],
              ["child", <Sparkles className="w-4 h-4" />, "Child View"]].map(([id, icon, label]) => (
              <button key={id} onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  tab === id ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>
                {icon}{label}
              </button>
            ))}
          </div>
        </div>

        {/* Specialist tab */}
        {tab === "specialist" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Task Library</p>
                <p className="font-bold text-slate-900 mt-0.5">Assign to Patient</p>
              </div>
              <span className="text-xs bg-sky-50 text-sky-700 font-semibold px-3 py-1.5 rounded-full">3 Patients Active</span>
            </div>
            <div className="space-y-3">
              {SPECIALIST_TASKS.map((t) => (
                <div key={t.name} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors group">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.category} · {t.patient}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      t.status === "Assigned" ? "bg-emerald-50 text-emerald-700"
                      : t.status === "In Progress" ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-500"}`}>
                      {t.status}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity">
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full border-2 border-dashed border-slate-200 hover:border-indigo-300 text-slate-400 hover:text-indigo-500 text-sm font-medium py-3 rounded-xl transition-colors">
              + Add New Task to Library
            </button>
          </div>
        )}

        {/* Child tab */}
        {tab === "child" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 max-w-sm mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-8 h-8 text-amber-400" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Hi Ethan 👋</p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">Today's Mission</h3>
            </div>
            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 mb-4">
              <p className="font-bold text-slate-900 text-center text-lg">Visual Focus Grid</p>
              <p className="text-sm text-slate-500 text-center mt-1">Look at the pattern and find the matching shape!</p>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {["🔵","🟡","🔴","🟡","🔴","🔵","🔴","🔵","🟡"].map((e, i) => (
                  <div key={i} className="aspect-square bg-white rounded-lg flex items-center justify-center text-xl shadow-sm border border-white hover:scale-105 transition-transform cursor-pointer">
                    {e}
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setChecked(!checked)}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm transition-all ${
                checked ? "bg-emerald-500 text-white shadow-md shadow-emerald-100" : "bg-slate-900 text-white hover:bg-slate-700"}`}>
              <CheckCircle2 className="w-5 h-5" />
              {checked ? "🎉 Great job! Mission Complete!" : "Mark as Done"}
            </button>
            {checked && (
              <div className="mt-3 text-center">
                <p className="text-xs text-emerald-600 font-semibold">+10 Stars earned! ⭐ Your specialist has been notified.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3">Trusted by Clinicians</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Voices from the Field</h2>
        </div>

        {/* Trust logos */}
        <div className="flex flex-wrap justify-center items-center gap-8 mb-12 opacity-50">
          {["Boston Children's", "NYC Therapy Assoc.", "MindBridge Clinic", "Synapse Health"].map((n) => (
            <span key={n} className="text-sm font-bold text-slate-500 tracking-tight">{n}</span>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 hover:shadow-md transition-shadow">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <blockquote className="text-slate-600 leading-relaxed text-sm mb-5">"{t.quote}"</blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">{t.initials}</div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-indigo-600 rounded-3xl p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)]" />
        <Brain className="w-10 h-10 text-indigo-200 mx-auto mb-4" />
        <h2 className="text-3xl font-extrabold text-white mb-3">Ready to Elevate Your Practice?</h2>
        <p className="text-indigo-200 mb-7 max-w-lg mx-auto">Join hundreds of specialists already using RePaIR to deliver more consistent, data-informed therapeutic outcomes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register"
            className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 font-bold px-7 py-3.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
            Request a Demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login"
            className="inline-flex items-center justify-center gap-2 border border-indigo-400 text-indigo-100 font-semibold px-7 py-3.5 rounded-xl hover:bg-indigo-500 transition-colors">
            Provider Login
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-800">Re<span className="text-indigo-600">PaIR</span> Specialist</span>
        </div>
        <p className="text-xs text-slate-400 text-center">
          © {new Date().getFullYear()} RePaIR Health Technologies. All rights reserved. · For clinical use only. Not a substitute for professional medical advice.
        </p>
        <div className="flex gap-5 text-xs text-slate-400">
          <a href="#" className="hover:text-slate-700 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-700 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-slate-700 transition-colors">HIPAA Notice</a>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Navbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DemoSection />
      <TestimonialsSection />
      <CtaBanner />
      <Footer />
    </div>
  );
}