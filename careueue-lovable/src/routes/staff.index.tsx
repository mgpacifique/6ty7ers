import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { AlertTriangle, PhoneCall, CheckCircle2, Clock, Users, Activity, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { endpoints, type QueueItem } from "@/lib/api";
import { useQueueSocket } from "@/lib/ws";
import { StaffShell } from "@/components/StaffShell";

export const Route = createFileRoute("/staff/")({
  head: () => ({ meta: [{ title: "Live Queue — CareQueue" }] }),
  component: StaffQueue,
});

function StaffQueue() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["queue"],
    queryFn: endpoints.queue,
    refetchInterval: 15_000,
  });
  const [stats, setStats] = useState<{ total: number; urgent: number; routine: number; unassigned: number } | null>(
    null,
  );
  const connected = useQueueSocket((e) => {
    if (e.event === "QUEUE_STATS") setStats(e.data);
    qc.invalidateQueries({ queryKey: ["queue"] });
  });

  const items = q.data ?? [];
  const urgent = items.filter((i) => i.track_type === "Urgent");
  const routine = items.filter((i) => i.track_type === "Routine");
  const unassigned = items.filter((i) => !i.track_type);
  const avgWait = useMemo(() => {
    if (!items.length) return 0;
    const now = Date.now();
    const sum = items.reduce((a, s) => a + (now - new Date(s.t1_check_in).getTime()) / 60000, 0);
    return Math.round(sum / items.length);
  }, [items]);

  return (
    <StaffShell
      title="Live Queue"
      subtitle="Borcelle Hospital · General Medicine · Today"
      connected={connected}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi
          icon={Users}
          label="Waiting"
          value={stats?.total ?? items.length}
          hint="Active sessions"
        />
        <Kpi icon={Clock} label="Avg wait" value={`${avgWait}m`} hint="Since check-in" />
        <Kpi icon={Activity} label="Routine" value={stats?.routine ?? routine.length} hint="FIFO track" />
        <Kpi
          icon={Zap}
          label="Urgent now"
          value={stats?.urgent ?? urgent.length}
          hint="Priority track"
          urgent={(stats?.urgent ?? urgent.length) > 0}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-3xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="font-display text-xl text-ink">Routine track</h2>
              <p className="text-xs text-muted-foreground">FIFO + starvation protected</p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {routine.length + unassigned.length} in line
            </span>
          </div>

          {q.isLoading ? (
            <SkeletonRows />
          ) : q.error ? (
            <ErrorBox message={(q.error as Error).message} />
          ) : (
            <QueueTable items={[...unassigned, ...routine]} />
          )}
        </section>

        <aside className="rounded-3xl border border-urgent/30 bg-urgent/5 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-urgent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-urgent" />
            </span>
            <h2 className="font-display text-xl text-ink">Urgent track</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Inserted ahead of routine queue automatically by the Smart Logic Engine.
          </p>

          <div className="mt-4 space-y-3">
            {urgent.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No urgent patients right now.
              </div>
            )}
            {urgent.map((s) => (
              <UrgentCard key={s.id} item={s} />
            ))}
          </div>
        </aside>
      </div>
    </StaffShell>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  urgent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  hint: string;
  urgent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        urgent ? "border-urgent/40 bg-urgent/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${urgent ? "text-urgent" : "text-primary"}`} />
        {label}
      </div>
      <div className={`font-display mt-2 text-3xl ${urgent ? "text-urgent" : "text-ink"}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}

function minsSince(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
}

function QueueTable({ items }: { items: QueueItem[] }) {
  const qc = useQueryClient();
  const call = useMutation({
    mutationFn: endpoints.call,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["queue"] }),
  });
  const complete = useMutation({
    mutationFn: endpoints.complete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["queue"] }),
  });
  const triage = useMutation({
    mutationFn: (v: { id: string; track: "Urgent" | "Routine" }) => endpoints.triage(v.id, v.track),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["queue"] }),
  });

  if (items.length === 0)
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        The queue is empty. New check-ins will show up here in real time.
      </div>
    );

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-widest text-muted-foreground">
            <th className="pb-2 font-semibold">Token</th>
            <th className="pb-2 font-semibold">Track</th>
            <th className="pb-2 font-semibold">Status</th>
            <th className="pb-2 font-semibold">Waiting</th>
            <th className="pb-2 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((s) => {
            const busy =
              (call.isPending && call.variables === s.id) ||
              (complete.isPending && complete.variables === s.id) ||
              (triage.isPending && triage.variables?.id === s.id);
            return (
              <tr key={s.id} className="align-middle">
                <td className="py-3">
                  <div className="font-display text-lg text-ink">{s.public_token}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Priority {s.dynamic_priority}
                  </div>
                </td>
                <td className="py-3">
                  <TrackChip track={s.track_type} />
                </td>
                <td className="py-3">
                  <StatusChip status={s.status} />
                </td>
                <td className="py-3">
                  <div className="inline-flex items-center gap-1 text-sm text-ink">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {minsSince(s.t1_check_in)}m
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {!s.track_type && (
                      <>
                        <button
                          disabled={busy}
                          onClick={() => triage.mutate({ id: s.id, track: "Routine" })}
                          className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-ink hover:bg-secondary disabled:opacity-50"
                        >
                          Routine
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => triage.mutate({ id: s.id, track: "Urgent" })}
                          className="rounded-full bg-urgent px-3 py-1 text-xs font-semibold text-urgent-foreground hover:opacity-90 disabled:opacity-50"
                        >
                          Urgent
                        </button>
                      </>
                    )}
                    {(s.status === "Triaged" || s.status === "Waiting") && (
                      <button
                        disabled={busy}
                        onClick={() => call.mutate(s.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                      >
                        <PhoneCall className="h-3 w-3" /> Call
                      </button>
                    )}
                    {s.status === "Called" && (
                      <button
                        disabled={busy}
                        onClick={() => complete.mutate(s.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3 w-3" /> Complete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function UrgentCard({ item }: { item: QueueItem }) {
  const qc = useQueryClient();
  const call = useMutation({
    mutationFn: endpoints.call,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["queue"] }),
  });
  return (
    <div className="rounded-2xl border border-urgent/30 bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="font-display text-2xl text-ink">{item.public_token}</div>
        <span className="rounded-full bg-urgent/10 px-2 py-0.5 text-[10px] font-semibold text-urgent">
          URGENT
        </span>
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <AlertTriangle className="h-3 w-3 text-urgent" /> Waiting {minsSince(item.t1_check_in)}m ·
        priority {item.dynamic_priority}
      </div>
      <button
        disabled={call.isPending || item.status === "Called"}
        onClick={() => call.mutate(item.id)}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-urgent py-2 text-xs font-semibold text-urgent-foreground disabled:opacity-50"
      >
        <PhoneCall className="h-3 w-3" /> {item.status === "Called" ? "Called" : "Call now"}
      </button>
    </div>
  );
}

function TrackChip({ track }: { track: QueueItem["track_type"] }) {
  if (!track)
    return (
      <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
        Untriaged
      </span>
    );
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        track === "Urgent" ? "bg-urgent/10 text-urgent" : "bg-primary/10 text-primary"
      }`}
    >
      {track}
    </span>
  );
}

function StatusChip({ status }: { status: QueueItem["status"] }) {
  const map: Record<string, string> = {
    Registered: "bg-secondary text-secondary-foreground",
    Triaged: "bg-accent/40 text-accent-foreground",
    Waiting: "bg-secondary text-secondary-foreground",
    Called: "bg-primary text-primary-foreground",
    Completed: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${map[status] ?? "bg-muted"}`}>
      {status}
    </span>
  );
}

function SkeletonRows() {
  return (
    <div className="mt-4 space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-12 animate-pulse rounded-xl bg-secondary" />
      ))}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      Couldn't load queue: {message}
    </div>
  );
}
