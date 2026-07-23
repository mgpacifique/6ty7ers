import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Clock } from "lucide-react";
import { useState } from "react";
import { endpoints, type QueueItem } from "@/lib/api";
import { StaffShell } from "@/components/StaffShell";
import { useQueueSocket } from "@/lib/ws";

export const Route = createFileRoute("/staff/triage")({
  head: () => ({ meta: [{ title: "Triage — CareQueue" }] }),
  component: Triage,
});

function minsSince(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
}

function Triage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["queue"], queryFn: endpoints.queue, refetchInterval: 15_000 });
  const connected = useQueueSocket(() => qc.invalidateQueries({ queryKey: ["queue"] }));
  const items = q.data ?? [];
  const untriaged = items.filter((i) => !i.track_type);
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const active = untriaged.find((i) => i.id === selected) ?? untriaged[0];

  const triage = useMutation({
    mutationFn: (v: { id: string; track: "Urgent" | "Routine" }) => endpoints.triage(v.id, v.track),
    onSuccess: () => {
      setNotes("");
      setSelected(null);
      qc.invalidateQueries({ queryKey: ["queue"] });
    },
  });

  return (
    <StaffShell title="New triage" subtitle="Rate urgency to route the patient" connected={connected}>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-3xl border border-border bg-card p-4">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-lg text-ink">Awaiting triage</h3>
            <span className="text-xs text-muted-foreground">{untriaged.length}</span>
          </div>
          <div className="mt-3 space-y-2">
            {untriaged.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
                No patients waiting for triage.
              </p>
            )}
            {untriaged.map((s) => {
              const isActive = active?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                    isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                  }`}
                >
                  <div>
                    <div className="font-display text-base">{s.public_token}</div>
                    <div className={`text-[11px] ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      Checked in {minsSince(s.t1_check_in)}m ago
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </aside>

        {active ? (
          <TriagePanel
            item={active}
            notes={notes}
            setNotes={setNotes}
            onTriage={(track) => triage.mutate({ id: active.id, track })}
            busy={triage.isPending}
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            Select a patient on the left to start triage.
          </div>
        )}
      </div>
    </StaffShell>
  );
}

function TriagePanel({
  item,
  notes,
  setNotes,
  onTriage,
  busy,
}: {
  item: QueueItem;
  notes: string;
  setNotes: (v: string) => void;
  onTriage: (track: "Urgent" | "Routine") => void;
  busy: boolean;
}) {
  const [choice, setChoice] = useState<"Urgent" | "Routine">("Routine");
  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold text-secondary-foreground">
          Step 2 of 3 · Urgency
        </span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" /> Checked in {minsSince(item.t1_check_in)} mins ago
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 font-display text-2xl text-primary">
          {item.public_token.split("-")[1]?.slice(0, 2) ?? "OP"}
        </div>
        <div className="min-w-0">
          <div className="font-display text-2xl leading-tight text-ink">Token {item.public_token}</div>
          {/* NOTE: patient name/reason/department are placeholders — the check-in
              schema does not currently capture reason or department. */}
          <div className="text-sm text-muted-foreground">Om Prakash · General Medicine</div>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Meta label="Reason" value="Fever, general checkup" />
        <Meta label="Department" value="General Medicine" />
        <Meta label="Est. wait" value="~28m" />
      </dl>

      <div className="mt-6">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Urgency level
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <UrgencyOption
            selected={choice === "Routine"}
            onClick={() => setChoice("Routine")}
            title="Non-Urgent"
            desc="Routine track, normal FIFO"
            side="~28m"
          />
          <UrgencyOption
            selected={choice === "Urgent"}
            onClick={() => setChoice("Urgent")}
            title="Emergency / High urgency"
            desc="Immediate insertion, priority"
            side="Now"
            urgent
          />
        </div>
      </div>

      <label className="mt-6 block">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Nurse notes
        </div>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes…"
          className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
        />
      </label>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Smart Logic Engine · urgent cases inserted ahead of the routine queue automatically.
        </p>
        <button
          disabled={busy}
          onClick={() => onTriage(choice)}
          className={`inline-flex items-center gap-1.5 rounded-2xl px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 ${
            choice === "Urgent" ? "bg-urgent" : "bg-primary"
          }`}
        >
          Route to {choice} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}

function UrgencyOption({
  selected,
  onClick,
  title,
  desc,
  side,
  urgent,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  side: string;
  urgent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
        selected
          ? urgent
            ? "border-urgent bg-urgent/5"
            : "border-primary bg-primary/5"
          : "border-border bg-background hover:bg-secondary"
      }`}
    >
      <div>
        <div className="text-sm font-semibold text-ink">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <div className={`text-sm font-semibold ${urgent ? "text-urgent" : "text-primary"}`}>{side}</div>
    </button>
  );
}
