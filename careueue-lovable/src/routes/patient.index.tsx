import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useState } from "react";
import { endpoints } from "@/lib/api";

export const Route = createFileRoute("/patient/")({
  head: () => ({ meta: [{ title: "CareQueue — Patient" }] }),
  component: PatientHome,
});

function PatientHome() {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");

  const req = useMutation({
    mutationFn: (p: string) => endpoints.patientRequestOtp(p),
    onSuccess: () => {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("cq_pending_phone", phone.trim());
      }
      nav({ to: "/patient/verify" });
    },
  });

  return (
    <div className="grain-bg flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" fill="currentColor" />
          <span className="font-display text-xl text-ink">CareQueue</span>
        </div>
        <h1 className="font-display mt-6 text-3xl text-ink">View your queue status</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your phone number to view your queue status. We'll text you a 6-digit code.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            req.mutate(phone.trim());
          }}
          className="mt-6 space-y-4"
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

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Not checked in yet? Please see the front desk.
        </p>
      </div>
    </div>
  );
}
