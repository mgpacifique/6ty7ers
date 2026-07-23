import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp, Zap } from "lucide-react";
import { endpoints } from "@/lib/api";
import { StaffShell } from "@/components/StaffShell";
import { useQueueSocket } from "@/lib/ws";

export const Route = createFileRoute("/staff/reports")({
  head: () => ({ meta: [{ title: "Reports — CareQueue" }] }),
  component: Reports,
});

function Reports() {
  const q = useQuery({ queryKey: ["queue"], queryFn: endpoints.queue, refetchInterval: 30_000 });
  const connected = useQueueSocket(() => q.refetch());
  const items = q.data ?? [];
  const urgent = items.filter((i) => i.track_type === "Urgent").length;

  const bars = [42, 38, 50, 70, 55, 30, 24];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const max = Math.max(...bars);

  return (
    <StaffShell title="Reports" subtitle="General Medicine · This week" connected={connected}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat value="24m" label="Avg true wait" hint="T2 − T1" delta="-6%" down />
        <Stat value="187" label="Patients served" hint="This week" delta="+12%" />
        <Stat value="12m" label="Avg consult time" hint="T3 − T2" delta="-2%" down />
        <Stat value={String(urgent)} label="Urgent cases" hint="Priority track" delta="+3" />
      </div>

      <section className="mt-6 rounded-3xl border border-border bg-card p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="font-display text-xl text-ink">Wait time trend</h2>
            <p className="text-xs text-muted-foreground">Minutes · last 7 days</p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">Peak Thu · 70 min</span>
        </div>
        <div className="mt-6 flex h-40 items-end gap-3">
          {bars.map((v, i) => {
            const h = (v / max) * 100;
            const peak = v === max;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-xl ${peak ? "bg-urgent" : "bg-primary/70"}`}
                  style={{ height: `${h}%` }}
                />
                <div className="text-[10px] font-semibold text-muted-foreground">{days[i]}</div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-center gap-2 text-primary">
            <Zap className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-widest">Starvation protection</span>
          </div>
          <p className="font-display mt-2 text-2xl text-ink">Active</p>
          <p className="text-sm text-muted-foreground">
            3 routine tokens auto-promoted today thanks to dynamic aging (+2 pts/min).
          </p>
        </div>
        <div className="rounded-3xl border border-urgent/30 bg-urgent/5 p-5">
          <div className="flex items-center gap-2 text-urgent">
            <TrendingUp className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-widest">Peak load</span>
          </div>
          <p className="font-display mt-2 text-2xl text-ink">Thursday</p>
          <p className="text-sm text-muted-foreground">70 min avg wait — consider staffing +1.</p>
        </div>
      </div>
    </StaffShell>
  );
}

function Stat({
  value,
  label,
  hint,
  delta,
  down,
}: {
  value: string;
  label: string;
  hint: string;
  delta: string;
  down?: boolean;
}) {
  const good = down; // downward wait time = good
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="font-display text-3xl text-ink">{value}</div>
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
            good ? "text-primary" : "text-accent-foreground"
          }`}
        >
          {down ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
          {delta}
        </span>
      </div>
      <div className="text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}
