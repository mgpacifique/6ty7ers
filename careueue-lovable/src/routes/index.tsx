import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareQueue — Borcelle Hospital" },
      {
        name: "description",
        content:
          "CareQueue by Borcelle Hospital. Calm, connected care from the moment you arrive.",
      },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="grain-bg relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-background px-6 py-12 sm:py-16">
      {/* soft decorative blobs */}
      <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="flex-1" />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <Heart className="h-7 w-7" fill="currentColor" />
        </div>

        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Welcome Screen
        </p>
        <h1 className="font-display mt-3 text-6xl leading-none text-ink sm:text-7xl">
          CareQueue
        </h1>
        <p className="mt-5 max-w-xs text-base text-muted-foreground">
          Borcelle Hospital, calm, connected care from the moment you arrive
        </p>
      </div>

      <div className="relative z-10 mt-12 w-full max-w-sm">
        <Link
          to="/patient"
          className="flex w-full items-center justify-center rounded-full bg-ink px-6 py-4 text-base font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Get Started
        </Link>

        <p className="mt-6 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Borcelle Hospital · CareQueue
        </p>
      </div>
    </div>
  );
}
