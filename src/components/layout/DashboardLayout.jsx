import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground font-sans transition-colors overflow-hidden relative">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <ThemeToggle />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-3 px-4 bg-card/80 backdrop-blur-md border-b border-border shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 -ml-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Toggle Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-semibold text-foreground tracking-tight flex items-center gap-2">
              <span className="font-extrabold bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">RePaIR</span>
            </h1>
          </div>
          {/* Spacer to prevent header content from overlapping with the absolutely positioned ThemeToggle button */}
          <div className="w-10"></div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto pb-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
