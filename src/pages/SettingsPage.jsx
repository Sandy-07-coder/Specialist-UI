import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store";

export function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage your settings configurations and details here.
        </p>
      </header>
      
      {/* Minimalist content skeleton */}
      <div className="h-64 rounded-xl border border-dashed border-gray-300 dark:border-gray-800 mt-8 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-900/20 mx-4 sm:mx-0">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
          <Settings className="w-6 h-6 text-gray-400 opacity-50" />
        </div>
        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">Settings Content</p>
        <p className="text-sm mt-1 text-center px-4 mb-4">This section is currently under development.</p>
        <Button onClick={handleLogout} variant="destructive" className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Log out
        </Button>
      </div>
    </div>
  );
}
