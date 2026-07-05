import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { FileEdit } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { StudentsPage } from "@/pages/StudentsPage";
import { CreateStudentPage } from "@/pages/CreateStudentPage";
import { StudentDetailsPage } from "@/pages/StudentDetailsPage";
import { StudentTasksPage } from "@/pages/StudentTasksPage";
import TasksPage from "@/pages/TasksPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { LandingPage } from "@/pages/LandingPage";
import { SignInPage } from "@/pages/SignInPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { useThemeStore } from "@/store";
import "./App.css";

// ── Theme Bootstrap ────────────────────────────────────────────────────────────
// Reads the persisted theme from the Zustand store on first render
// and applies the correct class to <html>, keeping Tailwind dark mode in sync.
function ThemeBootstrap() {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);
  return null;
}

// ── Placeholder ────────────────────────────────────────────────────────────────
const PagePlaceholder = ({ title }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <header>
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
        {title}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2">
        Manage your {title.toLowerCase()} configurations and details here.
      </p>
    </header>

    <div className="h-64 rounded-xl border border-dashed border-gray-300 dark:border-gray-800 mt-8 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-900/20 mx-4 sm:mx-0">
      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
        <FileEdit className="w-6 h-6 text-gray-400 opacity-50" />
      </div>
      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{title} Content</p>
      <p className="text-sm mt-1 text-center px-4">This section is currently under development.</p>
    </div>
  </div>
);

// ── App Root ───────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      {/* Applies persisted theme class to <html> without a Context wrapper */}
      <ThemeBootstrap />

      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<SignInPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/students/new" element={<CreateStudentPage />} />
            <Route path="/students/:id" element={<StudentDetailsPage />} />
            <Route path="/students/:id/tasks" element={<StudentTasksPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/specialists/:name" element={<ProfilePage />} />
            <Route path="/assessment" element={<PagePlaceholder title="Assessment" />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}
