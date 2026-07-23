import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Heart, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { endpoints, type QueueItem } from "@/lib/api";
import { useQueueSocket } from "@/lib/ws";
import { useStaffAuth } from "@/lib/auth";

export const Route = createFileRoute("/tv")({
  head: () => ({ meta: [{ title: "Waiting Room — CareQueue" }] }),
  component: TV,
});

function TV() {
  const { token } = useStaffAuth();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["queue"],
    queryFn: endpoints.queue,
    refetchInterval: 15_000,
    enabled: !!token,
  });
  const connected = useQueueSocket(() => qc.invalidateQueries({ queryKey: ["queue"] }));

  if (!token) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink p-8 text-primary-foreground">
        <div className="max-w-md text-center">
          <Heart className="mx-auto h-6 w-6 text-primary-foreground" fill="currentColor" />
          <h1 className="font-display mt-4 text-4xl">Waiting Room Display</h1>
          <p className="mt-2 text-primary-foreground/70">
            The TV board reads the live queue and needs a one-time staff sign-in on this device.
          </p>
          <Link
            to="/staff/login"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-ink"
          >
            Sign in as staff
          </Link>
        </div>
      </div>
    );
  }

  const items = q.data ?? [];
  const called = items.filter((i) => i.status === "Called");
  const urgent = items.filter((i) => i.track_type === "Urgent" && i.status !== "Completed");
  const upNext = items
    .filter((i) => i.status === "Triaged" || i.status === "Waiting" || i.status === "Registered")
    .sort((a, b) => b.dynamic_priority - a.dynamic_priority)
    .slice(0, 6);

  const nowServing = called[0];

  return (
    <div className="grain-bg min-h-screen bg-ink p-6 text-primary-foreground sm:p-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5" fill="currentColor" />
          <span className="font-display text-2xl">CareQueue</span>
          <span className="ml-2 rounded-full bg-primary-foreground/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest">
            Waiting room
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              connected ? "bg-primary/20 text-primary-foreground" : "bg-white/10"
            }`}
          >
            {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {connected ? "Live" : "Offline"}
          </span>
          <span className="font-display text-2xl tabular-nums">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground/60">
            Now serving
          </div>
          <div className="font-display mt-3 text-[10rem] leading-none tracking-tight sm:text-[12rem]">
            {nowServing?.public_token ?? "—"}
          </div>
          <div className="mt-4 text-lg text-primary-foreground/70">
            General Medicine · Room 4
          </div>
        </section>

        <section className="flex flex-col gap-6">
          {urgent[0] && (
            <div className="rounded-[2rem] border border-urgent/40 bg-urgent/10 p-6">
              <div className="flex items-center gap-2 text-urgent">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.3em]">
                  Urgent track
                </span>
              </div>
              <div className="font-display mt-2 text-5xl">
                {urgent[0].public_token} → Room 1
              </div>
            </div>
          )}
          <div className="flex-1 rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-foreground/60">
              Up next
            </div>
            <ul className="mt-4 space-y-3">
              {upNext.length === 0 && (
                <li className="text-primary-foreground/60">Queue is empty.</li>
              )}
              {upNext.map((s) => (
                <li key={s.id} className="flex items-baseline justify-between text-xl">
                  <span className="font-display">{s.public_token}</span>
                  <span className="text-primary-foreground/60">
                    <Track item={s} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <footer className="mt-10 text-center text-xs text-primary-foreground/50">
        Every patient, routed with care.
      </footer>
    </div>
  );
}

function Track({ item }: { item: QueueItem }) {
  if (item.track_type === "Urgent") return <span>Urgent · Room 1</span>;
  return <span>General Medicine · Room 4</span>;
}
