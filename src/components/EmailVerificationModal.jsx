import { useState, useEffect, useRef } from "react";
import { Mail, CheckCircle2, XCircle, RefreshCw, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

/**
 * EmailVerificationModal
 *
 * Props:
 *   email      {string}    – The email address to verify
 *   onVerified {function}  – Called when OTP is verified successfully
 *   onSkip     {function}  – Called when user chooses to skip / do it later
 */
export function EmailVerificationModal({ email, onVerified, onSkip }) {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");
  const [sendStatus, setSendStatus] = useState("idle"); // idle | sending | sent | error
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Auto-send OTP on mount
  useEffect(() => {
    handleSendOtp();
    return () => clearInterval(timerRef.current);
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    setSendStatus("sending");
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send OTP");
      setSendStatus("sent");
      startCooldown();
    } catch (err) {
      setSendStatus("error");
      setMessage(err.message || "Could not send OTP. Please try again.");
    }
  };

  // Handle each digit input
  const handleChange = (idx, value) => {
    const digit = value.replace(/\D/, "").slice(-1);
    const newOtp = [...otp];
    newOtp[idx] = digit;
    setOtp(newOtp);
    setStatus("idle");
    setMessage("");

    // Auto-advance focus
    if (digit && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      if (!otp[idx] && idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
      const newOtp = [...otp];
      newOtp[idx] = "";
      setOtp(newOtp);
    }
    if (e.key === "ArrowLeft" && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  // Handle paste across all boxes
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setStatus("error");
      setMessage("Please enter the complete 6-digit code.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");
      setStatus("success");
      setMessage(data.message || "Email verified!");
      setTimeout(() => onVerified(), 1500);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Invalid OTP. Please try again.");
    }
  };

  const isComplete = otp.every(Boolean);

  return (
    /* ── Backdrop ── */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred background overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 fade-in duration-300">

        {/* Gradient header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-8 text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4 shadow-lg">
            {status === "success"
              ? <CheckCircle2 className="w-8 h-8 text-white" />
              : <ShieldCheck className="w-8 h-8 text-white" />
            }
          </div>
          <h2 className="text-2xl font-bold text-white">Verify Your Email</h2>
          <p className="text-indigo-100 text-sm mt-1">One last step before you start</p>

          {/* Skip button */}
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Skip verification"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">

          {/* Email hint */}
          <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 rounded-xl px-4 py-3 mb-6">
            <Mail className="w-5 h-5 text-indigo-500 shrink-0" />
            <div>
              <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium uppercase tracking-wide">Code sent to</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{email}</p>
            </div>
            {sendStatus === "sending" && (
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin ml-auto shrink-0" />
            )}
          </div>

          {/* OTP Inputs */}
          <div className="flex gap-2 justify-center mb-5" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`
                  w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all
                  font-mono outline-none
                  bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  ${digit
                    ? "border-indigo-500 dark:border-indigo-400 shadow-md shadow-indigo-100 dark:shadow-indigo-900/30"
                    : "border-gray-200 dark:border-gray-700"
                  }
                  ${status === "error" ? "border-red-400 dark:border-red-500 shake" : ""}
                  ${status === "success" ? "border-green-400 dark:border-green-500" : ""}
                  focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800
                `}
                disabled={status === "loading" || status === "success"}
                aria-label={`OTP digit ${idx + 1}`}
              />
            ))}
          </div>

          {/* Status message */}
          {message && (
            <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 mb-4 ${
              status === "success"
                ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
            }`}>
              {status === "success"
                ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                : <XCircle className="w-4 h-4 shrink-0" />
              }
              <span>{message}</span>
            </div>
          )}

          {/* Verify button */}
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11 text-base transition-all"
            onClick={handleVerify}
            disabled={!isComplete || status === "loading" || status === "success"}
          >
            {status === "loading" ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Verifying…
              </span>
            ) : status === "success" ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Verified!
              </span>
            ) : (
              "Verify Email"
            )}
          </Button>

          {/* Resend link */}
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Didn&apos;t receive the code?{" "}
            {cooldown > 0 ? (
              <span className="text-indigo-400 dark:text-indigo-500 font-medium">
                Resend in {cooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendStatus === "sending"}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors underline-offset-2 hover:underline disabled:opacity-50"
              >
                {sendStatus === "sending" ? "Sending…" : "Resend Code"}
              </button>
            )}
          </div>

          {/* Skip link */}
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={onSkip}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Skip for now — I&apos;ll verify later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
