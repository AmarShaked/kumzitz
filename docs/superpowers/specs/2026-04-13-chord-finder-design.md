# Chord Finder — Design Spec

## Goal

Add a beta "Chord Finder" page (`/chord-finder`) that listens to the microphone and identifies the chord being played in real time. Instrument-agnostic.

## Architecture

Two new files + two modified files:

| File | Role |
|------|------|
| `src/features/chord-finder/useChordFinder.ts` | Mic + FFT hook. Returns detected notes and chord names. |
| `src/features/chord-finder/ChordFinderPage.tsx` | UI page. |
| `src/App.tsx` | Add `/chord-finder` route. |
| `src/components/Layout.tsx` | Add nav link with β badge. |

New dependency: `tonal` (music theory library, tree-shakeable).

## Audio Algorithm (`useChordFinder`)

1. Open mic via `getUserMedia`, connect through `AnalyserNode` (fftSize **16384**, ~2.7 Hz/bin at 44100 Hz).
2. Each `requestAnimationFrame`:
   - Compute RMS of the time-domain buffer. If below `0.01`, clear state (silence).
   - Get magnitude spectrum (`getFloatFrequencyData`).
   - Find local peaks above **−50 dB** threshold.
   - Map each peak frequency to a note name (C, C#, D … B) using the same semitone formula as the tuner, but discarding octave.
   - Deduplicate note classes, keep top **6 by magnitude**.
   - Call `Chord.detect(notes)` from `tonal` → sorted array of chord name strings.
3. Return state: `{ isListening, detectedNotes: string[], chords: string[], start, stop }`.

`start` and `stop` follow the same ref-cleanup pattern as `useTuner`.

## UI (`ChordFinderPage`)

- **Title:** "זיהוי אקורד" with an inline `בטא` pill (small, muted styling).
- **Primary chord display:** Large centered text (same scale as tuner's note display). Shows first element of `chords[]`, or `—` when silent.
- **Alternatives row:** If `chords.length > 1`, show the remaining names as smaller muted text (e.g. `"Am / C6"`).
- **Detected notes:** Row of small pills showing the note names (C, E, G…). Hidden when no signal.
- **Start/Stop button:** Same pattern as TunerPage — Mic icon to start, MicOff + destructive variant to stop.
- **Beta disclaimer:** Small muted text below the button: `"תכונה בניסוי — הדיוק מוגבל"`.

## Nav

In `Layout.tsx`, add a link to `/chord-finder` labelled `"זיהוי אקורד"` with a superscript `"β"` in muted color, positioned next to the existing tuner link.

## What This Is Not

- No instrument selection (instrument-agnostic by design).
- No chord history or session log.
- No confidence score display.
- No offline chord dictionary fallback — `tonal` handles all chord matching.
