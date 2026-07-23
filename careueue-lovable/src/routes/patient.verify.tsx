import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { endpoints } from "@/lib/api";
import { authStore } from "@/lib/auth";

export const Route = createFileRoute("/patient/verify")({
  head: () => ({ meta: [{ title: "Verify — CareQueue" }] }),
  component: Verify,
});

function Verify() {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  // If we came from the landing screen, phone + OTP request already happened.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const pending = window.sessionStorage.getItem("cq_pending_phone");
    if (pending) {
      setPhone(pending);
      setStep("otp");
      setCountdown(60);
      setTimeout(() => inputs.current[0]?.focus(), 50);
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const req = useMutation({
    mutationFn: (p: string) => endpoints.patientRequestOtp(p),
    onSuccess: () => {
      setStep("otp");
      setCountdown(60);
      setTimeout(() => inputs.current[0]?.focus(), 50);
    },
  });

  const verify = useMutation({
    mutationFn: (v: { phone: string; code: string }) => endpoints.patientVerifyOtp(v.phone, v.code),
    onSuccess: (r) => {
      authStore.setPatient(r.access_token, phone);
      if (typeof window !== "undefined") window.sessionStorage.removeItem("cq_pending_phone");
      nav({ to: "/patient/history" });
    },
  });

  const maskedPhone = phone
    ? phone.slice(0, phone.length - 5).replace(/./g, "X") + phone.slice(-5)
    : "+•• •••• XX";

  return (
    <div className="grain-bg flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <Link to="/patient" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-ink">
          <ArrowLeft className="h-3 w-3" /> Back
        </Link>
        <div className="mt-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" fill="currentColor" />
          <span className="font-display text-xl text-ink">CareQueue</span>
        </div>

        {step === "phone" ? (
          <>
            <h1 className="font-display mt-6 text-3xl text-ink">Verify it's you</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your phone number. We'll text you a 6-digit code.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                req.mutate(phone.trim());
              }}
              className="mt-6 space-y-3"
            >
              <label className="block">
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Phone number
                </div>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </label>
              {req.error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {(req.error as Error).message}
                </div>
              )}
              <button
                disabled={req.isPending}
                className="w-full rounded-2xl bg-ink py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {req.isPending ? "Sending code…" : "Send code"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-display mt-6 text-3xl text-ink">Verify it's you</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the code sent to {maskedPhone} to view your queue status.
            </p>
            <div className="mt-6 flex justify-between gap-2">
              {otp.map((v, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  value={v}
                  onChange={(e) => {
                    const next = [...otp];
                    next[i] = e.target.value.replace(/\D/g, "").slice(0, 1);
                    setOtp(next);
                    if (next[i] && i < 5) inputs.current[i + 1]?.focus();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
                  }}
                  className="font-display h-14 w-full min-w-0 rounded-2xl border border-border bg-background text-center text-2xl text-ink outline-none focus:border-primary"
                />
              ))}
            </div>

            <button
              disabled={otp.some((c) => !c) || verify.isPending}
              onClick={() => verify.mutate({ phone, code: otp.join("") })}
              className="mt-4 w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {verify.isPending ? "Verifying…" : "Verify"}
            </button>

            {verify.error && (
              <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {(verify.error as Error).message}
              </div>
            )}

            <div className="mt-4 text-center text-xs text-muted-foreground">
              {countdown > 0 ? (
                <>Didn't get it? Resend in 00:{String(countdown).padStart(2, "0")}</>
              ) : (
                <button
                  onClick={() => req.mutate(phone)}
                  className="font-semibold text-primary hover:underline"
                >
                  Resend code
                </button>
              )}
            </div>
            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              This code only unlocks your queue status — it's not a login or account.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
