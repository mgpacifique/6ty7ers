import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, LayoutGrid, ClipboardList, BarChart3, User, LogOut, Bell, Search, Wifi, WifiOff, UserPlus } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { authStore, useStaffAuth } from "@/lib/auth";

export function StaffShell({
  children,
  title,
  subtitle,
  connected,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  connected?: boolean;
}) {
  const { token, staff } = useStaffAuth();
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!token) nav({ to: "/staff/login" });
  }, [token, nav]);

  if (!token) return null;

  const links = [
    { to: "/staff", label: "Queue", icon: LayoutGrid },
    { to: "/staff/checkin", label: "Check-In", icon: UserPlus },
    { to: "/staff/triage", label: "Triage", icon: ClipboardList },
    { to: "/staff/reports", label: "Reports", icon: BarChart3 },
    { to: "/staff/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r border-border bg-surface lg:flex lg:flex-col">
          <div className="flex items-center gap-2 p-5">
            <Heart className="h-5 w-5 text-primary" fill="currentColor" />
            <div>
              <div className="font-display text-xl leading-none text-ink">CareQueue</div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Staff Console
              </div>
            </div>
          </div>
          <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
            {links.map((l) => {
              const active = l.to === "/staff" ? pathname === "/staff" : pathname.startsWith(l.to);
              const Icon = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Shift</div>
            <div className="mt-1 text-sm font-semibold text-ink">7:00 AM – 3:00 PM</div>
            <div className="text-xs text-muted-foreground">General Medicine</div>
            <button
              onClick={() => {
                authStore.clearStaff();
                nav({ to: "/staff/login" });
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2 text-xs font-semibold text-ink hover:bg-secondary"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <h1 className="font-display truncate text-2xl leading-tight text-ink sm:text-3xl">{title}</h1>
              {subtitle && <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>}
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 md:flex">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                placeholder="Search token, patient, doctor..."
                className="w-56 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                connected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}
              title={connected ? "Live updates connected" : "Live updates offline"}
            >
              {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {connected ? "Live" : "Offline"}
            </div>
            <button className="rounded-full border border-border bg-card p-2 text-muted-foreground hover:text-ink">
              <Bell className="h-4 w-4" />
            </button>
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 sm:flex">
              <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {(staff?.username ?? "S").slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-ink">{staff?.username}</span>
              <span className="rounded-full bg-accent/40 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                {staff?.role}
              </span>
            </div>
          </header>

          {/* Mobile nav */}
          <nav className="flex items-center gap-1 overflow-x-auto border-b border-border bg-surface px-2 py-2 lg:hidden">
            {links.map((l) => {
              const active = l.to === "/staff" ? pathname === "/staff" : pathname.startsWith(l.to);
              const Icon = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
