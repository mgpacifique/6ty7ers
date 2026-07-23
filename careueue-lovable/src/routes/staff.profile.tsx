import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2, Clock, Bell, Settings, LogOut, User } from "lucide-react";
import { authStore, useStaffAuth } from "@/lib/auth";
import { StaffShell } from "@/components/StaffShell";

export const Route = createFileRoute("/staff/profile")({
  head: () => ({ meta: [{ title: "Profile — CareQueue" }] }),
  component: Profile,
});

function Profile() {
  const { staff } = useStaffAuth();
  const nav = useNavigate();

  const rows = [
    { icon: Building2, label: "Borcelle Hospital", sub: "Main Branch" },
    { icon: Clock, label: "Shift hours", sub: "7:00 AM – 3:00 PM" },
    { icon: Bell, label: "Notifications", sub: "On" },
    { icon: Settings, label: "Account settings", sub: "Password, preferences" },
  ];

  return (
    <StaffShell title="Profile" subtitle="Nurse · General Medicine">
      <div className="mx-auto max-w-xl">
        <div className="rounded-3xl border border-border bg-card p-6 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {(staff?.username ?? "S").slice(0, 1).toUpperCase()}
          </div>
          <h1 className="font-display mt-3 text-2xl text-ink">{staff?.username}</h1>
          <span className="mt-1 inline-block rounded-full bg-accent/40 px-3 py-1 text-xs font-semibold text-accent-foreground">
            {staff?.role} · General Medicine
          </span>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <MiniStat value="412" label="Patients" />
            <MiniStat value="94%" label="On-time" />
            <MiniStat value="4.9" label="Rating" />
          </div>
        </div>

        <div className="mt-4 divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card">
          {rows.map((r) => (
            <button
              key={r.label}
              className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-secondary"
            >
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-ink">
                <r.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-ink">{r.label}</div>
                <div className="text-xs text-muted-foreground">{r.sub}</div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            authStore.clearStaff();
            nav({ to: "/staff/login" });
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-3 text-sm font-semibold text-destructive"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </StaffShell>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-surface p-2">
      <div className="font-display text-lg text-ink">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
