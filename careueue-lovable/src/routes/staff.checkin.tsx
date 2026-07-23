import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { endpoints } from "@/lib/api";
import { StaffShell } from "@/components/StaffShell";

export const Route = createFileRoute("/staff/checkin")({
  head: () => ({ meta: [{ title: "Check-In Patient — CareQueue" }] }),
  component: StaffCheckIn,
});

function StaffCheckIn() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const m = useMutation({
    mutationFn: (v: { name: string; phone: string }) => endpoints.checkIn(v.name, v.phone),
  });

  return (
    <StaffShell title="Check-In Patient" subtitle="Register a walk-in and issue a queue token">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <div className="font-display text-2xl text-ink">New patient</div>
              <div className="text-xs text-muted-foreground">
                Details are only used for this visit.
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              m.mutate({ name: name.trim(), phone: phone.trim() });
            }}
            className="mt-6 space-y-4"
          >
            <Field label="Full name">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Patient name"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </Field>
            <Field label="Phone number">
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </Field>

            {m.error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {(m.error as Error).message}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={m.isPending}
                className="flex-1 rounded-2xl bg-ink py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {m.isPending ? "Checking in…" : "Issue token"}
              </button>
              <button
                type="button"
                onClick={() => {
                  m.reset();
                  setName("");
                  setPhone("");
                }}
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-ink"
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Latest token issued
          </div>
          {m.data ? (
            <div className="mt-3 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                Give this to the patient
              </div>
              <div className="font-display mt-1 text-6xl text-ink">{m.data.public_token}</div>
              <p className="mt-3 text-sm text-muted-foreground">
                Status: {m.data.status}
                {m.data.track_type ? ` · ${m.data.track_type}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Patient will get SMS updates as their turn approaches.
              </p>
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
              Fill in the form and issue a token — it'll show here so you can read it out to
              the patient.
            </div>
          )}
        </section>
      </div>
    </StaffShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary">
        {children}
      </div>
    </label>
  );
}
