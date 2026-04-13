# Tuner Page Redesign — Design Spec

## Goal

Redesign `TunerPage.tsx` to match the GuitarTuna-inspired layout: horizontal scrolling tuning graph with a moving cents bubble, strings flanking a minimal SVG headstock silhouette, instrument cycling via top bar. `useTuner` hook is untouched.

## Files Changed

| File | Change |
|------|--------|
| `src/features/tuner/TunerPage.tsx` | Complete UI rewrite |

No other files change.

## Layout (top to bottom)

1. Top bar
2. Tuning graph
3. Instrument area (strings + SVG headstock)
4. Start/stop button

Container: `mx-auto max-w-sm px-4 py-6` (phone-like proportions).

## Section 1 — Top Bar

- Left: instrument name (e.g. "גיטרה") in bold + `›` chevron, clickable — cycles through instruments on click (`guitar → ukulele → ukulele-low-g → guitar`). Tuning variant name below in muted small text ("Standard" / "Low-G").
- Right: nothing. No AUTO toggle.
- Clicking the instrument name while tuner is listening first stops the tuner, then switches instrument (same logic as current `handleInstrumentChange`).

## Section 2 — Tuning Graph

- Container: `h-28` (112px), dark background (`bg-muted/10`), rounded-lg, `overflow-hidden`, `relative`.
- Grid lines: CSS `repeating-linear-gradient` — subtle horizontal + vertical lines every 18px, color `rgba(255,255,255,0.04)`.
- Center line: absolute, `left-1/2`, full height, `w-0.5 bg-destructive`.
- **Cents bubble**: absolute circle, `w-10 h-10`, centered vertically at top-1/4. Horizontal position: `left: calc(50% + (cents / 50) * 45%)` clamped to stay within graph. Color: `bg-destructive` when out of tune, `bg-success` when in tune. Shows the cents number inside (e.g. `-7`). Hidden when no note detected.
- **Direction label**: positioned to the right of the bubble when cents < 0 (bubble left of center), to the left when cents > 0. Text: "כוון למעלה" (cents < −5), "כוון למטה" (cents > +5), "מכוון! ✓" (in tune). Small dark pill background. Hidden when no note.
- **Note + octave pill**: absolute, `bottom-2 left-1/2 -translate-x-1/2`. Dark rounded pill. Text: note name + superscript octave (e.g. `G<sup>3</sup>`). Hidden when no note.

## Section 3 — Instrument Area

Flex row: `items-center justify-between gap-2`, height ~`h-36`.

**Left column** — 2 or 3 string circles stacked vertically (`flex flex-col gap-3`):
- Guitar: E2, A2, D3
- Ukulele / Ukulele Low-G: G (octave depends on tuning), C4

**Center** — SVG headstock silhouette, `w-16` (~64px wide, ~100px tall):
- Neck: narrow rounded rectangle, top portion
- Body: slightly wider rounded rectangle, wood-brown fill (`#7c4f2a` or similar muted brown in both themes)
- Tuning pegs: 3 pairs of small circles (guitar) or 2 pairs (ukulele), rendered as small circles on left + right edges of the body

**Right column** — remaining string circles:
- Guitar: G3, B3, E4
- Ukulele / Ukulele Low-G: E4, A4

**String circle styling:**
- Size: `w-11 h-11` (44px), `rounded-full`, `flex items-center justify-center`, `text-sm font-bold`
- Active (closest detected string): `bg-primary text-primary-foreground scale-110 shadow-lg`
- Inactive: `bg-secondary text-secondary-foreground`
- Label: note name only (no octave) — e.g. "G", "C", "E", "A"

## Section 4 — Start/Stop Button

Centered. Same as current implementation:
- Not listening: `<Button size="lg">` with Mic icon + "התחל כיוון"
- Listening: `<Button size="lg" variant="destructive">` with MicOff icon + "עצור"

## Instrument Configs (unchanged from current)

```
guitar:        E2 A2 D3 | G3 B3 E4
ukulele:       G4 C4    | E4 A4
ukulele-low-g: G3 C4    | E4 A4
```

Left column = first half of strings array, right column = second half.

## What This Is Not

- No AUTO toggle
- No needle/semicircle gauge (fully replaced by horizontal graph)
- No changes to `useTuner.ts`
- No changes to routing or nav
