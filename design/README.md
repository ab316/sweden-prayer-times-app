# design/

Inputs for the AI implementation workflow. Everything in this folder is **exported from Google Stitch** and consumed (read-only) by Claude Code or Codex when implementing screens. See [`/AGENTS.md`](../AGENTS.md) for the full workflow.

## Layout

```
design/
├── README.md                           ← this file
├── Design.md                           ← single, app-wide spec from Stitch
└── screens/
    └── <screen-name>/
        └── stitch.html                 ← per-screen HTML from Stitch's "Get code"
```

- **`Design.md`** is **app-wide** — design system (colors, typography, spacing), navigation, and the screen inventory. Re-export from Stitch and overwrite this file whenever any of those change.
- **`screens/<screen-name>/stitch.html`** is **per-screen** — raw output from Stitch's "Get code" button. Untouched. `<screen-name>` is kebab-case and matches the intended Expo Router route.

## Loop

1. Design (or update) screens in Stitch.
2. If the design system changed → re-export `Design.md` and overwrite `design/Design.md`.
3. For each screen → "Get code" → save HTML to `design/screens/<screen-name>/stitch.html`.
4. Prompt the agent: *"implement design/screens/<screen-name>"*.
5. Agent reads `Design.md` first, reconciles `tailwind.config.js` if needed, then implements the screen.

## Rules

- **Don't hand-edit files in this folder.** They are inputs. If something needs to change, change it in Stitch and re-export.
- The agent does not write here. It only reads.
- Adding `notes.md` next to a screen's `stitch.html` is allowed for one-off overrides not expressible in Stitch (e.g. "use the live API endpoint at /api/prayer-times for the data on this screen"). Optional, never required.
