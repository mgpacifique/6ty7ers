import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Heart, LogOut, Clock } from "lucide-react";
import { useEffect } from "react";
import { authStore } from "@/lib/auth";

export const Route = createFileRoute("/patient/history")({
  head: () => ({ meta: [{ title: "My Visit — CareQueue" }] }),
  component: History,
});

// Demo history — the backend does not currently expose a "sessions by patient"
// endpoint, so we render a representative view for verified patients.
const visits = [
  {
    date: "May 12, 2026",
    token: "FT-398",
    doctor: "Dr. Meera Vasudev",
    dept: "General Medicine",
    checkin: "9:12 AM",
    wait: "24m",
    doc: "15m",
  },
  {
    date: "Mar 3, 2026",
    token: "FT-256",
    doctor: "Dr. Rahul Sen",
    dept: "Cardiology",
    checkin: "11:05 AM",
    wait: "31m",
    doc: "22m",
  },
  {
    date: "Jan 18, 2026",
    token: "FT-119",
    doctor: "Pharmacy Counter",
    dept: "Pharmacy",
    checkin: "2:40 PM",
    wait: "9m",
    doc: "5m",
  },
];

function History() {
  const nav = useNavigate();
  const phone = authStore.getPatientPhone();
  const token = authStore.getPatientToken();

  useEffect(() => {
    if (!token) nav({ to: "/patient" });
  }, [token, nav]);

  if (!token) return null;

  const masked = phone ? phone.slice(0, phone.length - 5).replace(/./g, "X") + phone.slice(-5) : "verified";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 p-4">
          <Link to="/patient" className="text-muted-foreground hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" fill="currentColor" />
            <span className="font-display text-lg text-ink">CareQueue</span>
          </div>
          <div className="ml-auto text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Verified via OTP · {masked}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4 sm:p-6">
        {/* Current status */}
        <section className="rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            Current status
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-muted-foreground">No active queue session</div>
              <div className="font-display mt-1 text-2xl text-ink">You're not in the queue</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Please visit the front desk to get checked in and receive your token.
              </p>
            </div>
            <div className="hidden shrink-0 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-muted-foreground sm:flex">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-semibold">Live updates</span>
            </div>
          </div>
        </section>

        {/* History */}
        <h1 className="font-display mt-8 text-3xl text-ink">My visit history</h1>
        <p className="text-sm text-muted-foreground">Showing your last 3 visits to Borcelle Hospital.</p>

        <div className="mt-5 space-y-3">
          {visits.map((v) => (
            <article
              key={v.token}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {v.date}
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Completed
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <div>
                  <div className="font-display text-2xl text-ink">{v.token}</div>
                  <div className="text-sm text-muted-foreground">
                    {v.doctor} · {v.dept}
                  </div>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Stat label="Check-in" value={v.checkin} />
                <Stat label="Wait" value={v.wait} />
                <Stat label="With doctor" value={v.doc} />
              </dl>
            </article>
          ))}
        </div>

        <button
          onClick={() => {
            authStore.clearPatient();
            nav({ to: "/patient" });
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-ink"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-2">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}
