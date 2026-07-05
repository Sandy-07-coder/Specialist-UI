import { NavLink } from "react-router-dom";
import { Users, User, CheckSquare, FileEdit, Settings, X, LayoutDashboard } from "lucide-react";
import { useUserStore } from "@/store";

export function Sidebar({ isOpen, setIsOpen }) {
  const name = useUserStore((s) => s.name) || "Specialist";
  const serviceDomain = useUserStore((s) => s.serviceDomain) || "Special Educator";

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Students", path: "/students", icon: Users },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
    { name: "Assessment", path: "/assessment", icon: FileEdit },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 border-r border-border/60 bg-slate-50 dark:bg-slate-900 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        <div className="flex justify-end p-4 md:hidden">
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Section */}
        <NavLink
          to="/profile"
          onClick={() => setIsOpen(false)}
          className="p-8 pb-6 flex flex-col items-center border-b border-slate-200 dark:border-slate-800 md:pt-8 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
        >
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-700 shadow-sm overflow-hidden mb-4 ring-1 ring-slate-200 dark:ring-slate-700 group-hover:ring-primary/40 transition-all duration-300 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
            <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-primary transition-colors">{name}</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{serviceDomain}</p>
        </NavLink>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
