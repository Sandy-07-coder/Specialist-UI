import { LogOut, Settings, ShieldCheck, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";

export function SettingsPage() {
  const navigate  = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl">
      <header>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage your account preferences and security.
        </p>
      </header>

      {/* ── Account Section ── */}
      <Card className="border-border bg-card text-card-foreground shadow-sm">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <User className="w-4 h-4 text-muted-foreground" />
            Account
          </CardTitle>
          <CardDescription>Manage your login and security settings.</CardDescription>
        </CardHeader>

        <CardContent className="pt-5 space-y-4">
          {/* Email verification banner */}
          <EmailVerificationBanner />

          <Separator />

          {/* Logout */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Sign out</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You will be returned to the landing page.
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Placeholder for future settings ── */}
      <div className="h-40 rounded-xl border border-dashed border-gray-300 dark:border-gray-800 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-900/20">
        <Settings className="w-6 h-6 mb-2 opacity-40" />
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">More settings coming soon</p>
        <p className="text-xs mt-1 text-center px-6">Notification preferences, appearance, and integrations.</p>
      </div>
    </div>
  );
}
