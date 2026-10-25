import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { sendLoginCode, verifyLoginCode } from "../lib/api";
import {
  normalizeEmail,
  isValidEmail,
  isAllowedEmail,
  friendlyAuthError,
} from "../lib/format";

const DOMAIN = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN;
const RESEND_COOLDOWN = 60;

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const codeRef = useRef(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  async function handleSendCode(e) {
    e.preventDefault();
    setError("");
    const norm = normalizeEmail(email);
    if (!isValidEmail(norm)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (DOMAIN && !isAllowedEmail(norm, DOMAIN)) {
      setError(`Use your @${DOMAIN} email.`);
      return;
    }
    setLoading(true);
    try {
      await sendLoginCode(norm);
      setEmail(norm);
      setCode("");
      setStep("code");
      setCountdown(RESEND_COOLDOWN);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function submitCode(codeValue) {
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      await verifyLoginCode(email, codeValue);
      navigate("/");
    } catch (err) {
      setError(friendlyAuthError(err));
      setCode("");
      codeRef.current?.focus();
    } finally {
      setLoading(false);
    }
  }

  function handleCodeChange(e) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (error) setError("");
    if (digits.length === 6) submitCode(digits);
  }

  async function handleResend() {
    if (countdown > 0 || loading) return;
    setError("");
    setCode("");
    setLoading(true);
    try {
      await sendLoginCode(email);
      setCountdown(RESEND_COOLDOWN);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">Katha</h1>
          <p className="mt-2 text-white/70">
            Leave a note. Someone nearby will find it.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">
          {step === "email" ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder={DOMAIN ? `you@${DOMAIN}` : "you@example.com"}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {DOMAIN && (
                  <p className="mt-1 text-xs text-gray-500">
                    Use your @{DOMAIN} email
                  </p>
                )}
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-60 active:opacity-80"
              >
                {loading ? "Sending…" : "Send code"}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-gray-900">{email}</span>.
                Check your inbox and spam folder.
              </p>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  One-time code
                </label>
                <input
                  ref={codeRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={handleCodeChange}
                  disabled={loading}
                  placeholder="000000"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={() => submitCode(code)}
                disabled={loading || code.length !== 6}
                className="w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-60 active:opacity-80"
              >
                {loading ? "Verifying…" : "Verify"}
              </button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || loading}
                  className="text-sm font-medium text-primary disabled:text-gray-400"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setError("");
                  }}
                  className="text-sm text-gray-500 underline"
                >
                  Use a different email
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-white/60">
          We'll email you a one-time code. No password needed.
        </p>
      </div>
    </div>
  );
}
