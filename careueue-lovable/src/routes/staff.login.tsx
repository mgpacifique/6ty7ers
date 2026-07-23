import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, LogIn, Lock, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { endpoints } from "@/lib/api";
import { authStore } from "@/lib/auth";

export const Route = createFileRoute("/staff/login")({
  head: () => ({ meta: [{ title: "Staff Login — CareQueue" }] }),
  component: StaffLogin,
});

function StaffLogin() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Doctor" | "Admin">("Doctor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await endpoints.staffLogin(username.trim(), password);
      authStore.setStaff(r.access_token, r.staff);
      nav({ to: "/staff" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
      <div className="grain-bg relative hidden flex-col justify-between border-r border-border bg-surface p-10 lg:flex">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" fill="currentColor" />
          <span className="font-display text-2xl text-ink">CareQueue</span>
          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            SECURE
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Borcelle Hospital
          </p>
          <h1 className="font-display mt-3 max-w-md text-5xl leading-[1.05] text-ink">
            Every patient, routed with care.
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Sign in to the CareQueue Staff Console to triage arrivals, call the next patient, and keep the
            waiting room informed in real time.
          </p>
        </div>
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">v2.4 · Staff Console</div>
      </div>

      <div className="flex flex-col justify-center bg-card p-6 sm:p-12">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="text-xs font-semibold text-muted-foreground hover:text-ink">
            ← Back
          </Link>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Sign in to continue
          </p>
          <h2 className="font-display mt-1 text-3xl text-ink">Welcome back</h2>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Username" icon={UserIcon}>
              <input
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. nurse_grace"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </Field>
            <Field label="Password" icon={Lock}>
              <input
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </Field>

            <div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Role
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["Doctor", "Admin"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                      role === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-ink"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Role is granted by the backend on login.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" /> {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-dashed border-border bg-surface p-3 text-[11px] text-muted-foreground">
            <div className="font-semibold text-ink">Demo accounts</div>
            <div>admin_amina / admin123</div>
            <div>nurse_grace / nurse123</div>
            <div>doctor_jean / doctor123</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 focus-within:border-primary">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {children}
      </div>
    </label>
  );
}
