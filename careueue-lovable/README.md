# CareQueue Frontend — Source Export (from Lovable)

This is the real source code from your Lovable project ("Queue Companion UI"),
pulled file-by-file and verified against the live project.

## What tech was actually used

- **React 19** — the UI library
- **TypeScript** — typed JavaScript
- **TanStack Start** (not plain Vite/React Router) — a full-stack React
  framework that handles routing, server rendering, and the dev server
  together. `TanStack Router` does the page routing specifically.
- **TanStack Query** — handles all data-fetching/caching to the backend
- **Tailwind CSS v4** — utility-based styling (this is your colleague's "CSS"
  — Lovable doesn't hand-write plain CSS files, it's all Tailwind classes
  plus one small `src/styles.css` for design tokens/fonts)
- **shadcn/ui** + **Radix UI** — the underlying accessible component
  primitives (dialogs, dropdowns, etc.) that Lovable scaffolds in automatically
- **lucide-react** — the icon set used throughout (Heart, Clock, User, etc.)
- **Bun** — the package manager/runtime (not npm) — this project uses
  `bun.lock`, not `package-lock.json`

So to directly answer "JavaScript, CSS, React?" — yes to all three, but more
precisely: **React + TypeScript, styled with Tailwind CSS, wired together by
TanStack Start, running on Bun.**

## What's included in this folder

Every file that's custom to this app: all routes (`src/routes/*.tsx`), the
API client (`src/lib/api.ts`), auth handling (`src/lib/auth.ts`), WebSocket
handling (`src/lib/ws.ts`), the staff shell/sidebar component, and all config
files (Tailwind theme, TypeScript, package.json).

## What's NOT included, and why

~40 stock **shadcn/ui** primitive components (button, dialog, dropdown, etc.)
were intentionally left out — they're unmodified library boilerplate, not
anything anyone wrote by hand. To regenerate them once you've unzipped this:

```bash
bun install
bunx shadcn@latest add button dialog dropdown-menu select tabs # etc as needed
```

Also excluded: `src/routeTree.gen.ts` (auto-regenerates the first time you
run `bun run dev` — never hand-edited) and a few Lovable-platform error
logging files that aren't part of the app's actual functionality.

## Running it

```bash
bun install
cp .env.example .env   # if missing, create .env with VITE_API_BASE_URL=<your backend URL>
bun run dev
```

## Known gaps vs. the backend (carried over from earlier review)

- `staff.triage.tsx` shows a hardcoded patient name/reason/department
  ("Om Prakash", "Fever, general checkup") — the backend's check-in schema
  doesn't capture reason or department yet, so this is a placeholder.
- `patient.history.tsx` shows representative visit history — no backend
  endpoint exists yet to fetch a patient's real past sessions.
- The TV display (`tv.tsx`) is real, live data — it cleverly requires a
  one-time staff login on that device to read the queue, since there's no
  public endpoint.
