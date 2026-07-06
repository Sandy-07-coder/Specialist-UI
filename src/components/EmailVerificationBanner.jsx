import { useState } from "react";
import { ShieldAlert, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailVerificationModal } from "@/components/EmailVerificationModal";
import { useUserStore, useAuthStore } from "@/store";

/**
 * EmailVerificationBanner
 *
 * Renders a dismissible warning banner when the signed-in user has
 * not yet verified their email address.  Clicking the CTA opens the
 * EmailVerificationModal inline (no navigation required).
 *
 * Disappears automatically once verification succeeds.
 */
export function EmailVerificationBanner() {
  const isEmailVerified = useUserStore((s) => s.isEmailVerified);
  const email           = useUserStore((s) => s.email);
  const token           = useAuthStore((s) => s.token);
  const fetchProfile    = useUserStore((s) => s.fetchProfile);

  const [dismissed, setDismissed]   = useState(false);
  const [showModal,  setShowModal]   = useState(false);

  // Nothing to show if already verified or user dismissed
  if (isEmailVerified || dismissed) return null;

  const handleVerified = async () => {
    setShowModal(false);
    // Re-sync profile so isEmailVerified becomes true in the store
    if (token) await fetchProfile(token);
  };

  return (
    <>
      {/* ── Banner ── */}
      <div className="relative flex items-start gap-3 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3.5 shadow-sm animate-in fade-in slide-in-from-top-1 duration-300">
        {/* Icon */}
        <div className="mt-0.5 shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Email not verified
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
            Verify <span className="font-medium">{email}</span> to unlock all features and secure your account.
          </p>
        </div>

        {/* CTA */}
        <Button
          size="sm"
          onClick={() => setShowModal(true)}
          className="shrink-0 h-8 text-xs bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-500 text-white border-0 shadow-sm gap-1.5"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Verify Now
        </Button>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 mt-0.5 text-amber-400 hover:text-amber-600 dark:text-amber-500 dark:hover:text-amber-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Modal (rendered at the end of the tree so z-index is correct) ── */}
      {showModal && (
        <EmailVerificationModal
          email={email}
          onVerified={handleVerified}
          onSkip={() => setShowModal(false)}
        />
      )}
    </>
  );
}
