import { NavLink } from "react-router-dom";
import { Users, CheckSquare, FileEdit, Settings, X, LayoutDashboard } from "lucide-react";

export function Sidebar({ isOpen, setIsOpen }) {
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
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 border-r border-border bg-card flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex justify-end p-4 md:hidden">
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Section */}
        <NavLink 
          to="/profile"
          onClick={() => setIsOpen(false)}
          className="p-8 pb-6 flex flex-col items-center border-b border-border md:pt-8 hover:bg-accent hover:text-accent-foreground/50 transition-colors group cursor-pointer"
        >
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-sm overflow-hidden mb-4 ring-1 ring-border group-hover:ring-slate-400 dark:group-hover:ring-slate-500 transition-all duration-300">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher"
              alt="User profile"
              className="w-full h-full object-cover bg-muted"
            />
          </div>
          <h2 className="font-semibold text-foreground group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">Alex Johnson</h2>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">Special Educator</p>
        </NavLink>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
