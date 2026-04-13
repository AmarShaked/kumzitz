# Chord Finder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a beta `/chord-finder` page that listens to the microphone and identifies chords in real time using FFT peak detection and the tonal library.

**Architecture:** `useChordFinder` hook handles all audio logic (mic, FFT, note extraction, chord detection). `ChordFinderPage` is pure UI. Route added to `App.tsx`, nav link added to `Layout.tsx`.

**Tech Stack:** React, TypeScript, Web Audio API, tonal (new dependency), Vitest

---

### Task 1: Install tonal

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install the package**

```bash
npm install tonal
```

Expected output includes `added N packages` with `tonal` listed.

- [ ] **Step 2: Verify the import resolves**

```bash
node -e "import('tonal').then(m => console.log(Object.keys(m)))"
```

Expected: prints an array that includes `"Chord"`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add tonal music theory library"
```

---

### Task 2: Create `useChordFinder` hook with unit tests

**Files:**
- Create: `src/features/chord-finder/useChordFinder.ts`
- Create: `src/features/chord-finder/useChordFinder.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/features/chord-finder/useChordFinder.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { frequencyToNoteName } from './useChordFinder';

describe('frequencyToNoteName', () => {
  it('maps A4 (440 Hz) to A', () => {
    expect(frequencyToNoteName(440)).toBe('A');
  });

  it('maps E2 (82.41 Hz) to E', () => {
    expect(frequencyToNoteName(82.41)).toBe('E');
  });

  it('maps C4 (261.63 Hz) to C', () => {
    expect(frequencyToNoteName(261.63)).toBe('C');
  });

  it('maps G3 (196 Hz) to G', () => {
    expect(frequencyToNoteName(196)).toBe('G');
  });

  it('maps F#4 (369.99 Hz) to F#', () => {
    expect(frequencyToNoteName(369.99)).toBe('F#');
  });
});
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm test -- src/features/chord-finder/useChordFinder.test.ts
```

Expected: FAIL with `Cannot find module './useChordFinder'`

- [ ] **Step 3: Create `src/features/chord-finder/useChordFinder.ts`**

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import { Chord } from 'tonal';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function frequencyToNoteName(freq: number): string {
  const semitonesFromC0 = 12 * Math.log2(freq / 16.3516);
  const rounded = Math.round(semitonesFromC0);
  const noteIndex = ((rounded % 12) + 12) % 12;
  return NOTE_NAMES[noteIndex];
}

function detectNotes(analyser: AnalyserNode): string[] {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  analyser.getFloatFrequencyData(dataArray);

  const sampleRate = analyser.context.sampleRate;
  const THRESHOLD_DB = -50;
  const MIN_FREQ = 60;
  const MAX_FREQ = 1200;

  const peaks: { freq: number; db: number }[] = [];

  for (let i = 1; i < bufferLength - 1; i++) {
    const freq = (i * sampleRate) / analyser.fftSize;
    if (freq < MIN_FREQ || freq > MAX_FREQ) continue;
    if (dataArray[i] < THRESHOLD_DB) continue;
    if (dataArray[i] > dataArray[i - 1] && dataArray[i] > dataArray[i + 1]) {
      peaks.push({ freq, db: dataArray[i] });
    }
  }

  peaks.sort((a, b) => b.db - a.db);

  const noteSet = new Set<string>();
  for (const { freq } of peaks.slice(0, 6)) {
    noteSet.add(frequencyToNoteName(freq));
  }

  return Array.from(noteSet);
}

export type ChordFinderState = {
  isListening: boolean;
  detectedNotes: string[];
  chords: string[];
};

export function useChordFinder() {
  const [state, setState] = useState<ChordFinderState>({
    isListening: false,
    detectedNotes: [],
    chords: [],
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
    setState({ isListening: false, detectedNotes: [], chords: [] });
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 16384;
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      streamRef.current = stream;

      setState((s) => ({ ...s, isListening: true }));

      const timeBuffer = new Float32Array(analyser.fftSize);

      const tick = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getFloatTimeDomainData(timeBuffer);
        let rms = 0;
        for (let i = 0; i < timeBuffer.length; i++) rms += timeBuffer[i] * timeBuffer[i];
        rms = Math.sqrt(rms / timeBuffer.length);

        if (rms < 0.01) {
          setState((s) => ({ ...s, detectedNotes: [], chords: [] }));
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        const notes = detectNotes(analyserRef.current);
        const chords = notes.length >= 2 ? Chord.detect(notes) : [];
        setState((s) => ({ ...s, detectedNotes: notes, chords }));

        rafRef.current = requestAnimationFrame(tick);
      };

      tick();
    } catch {
      setState((s) => ({ ...s, isListening: false }));
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioContextRef.current?.close();
    };
  }, []);

  return { ...state, start, stop };
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
npm test -- src/features/chord-finder/useChordFinder.test.ts
```

Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/chord-finder/useChordFinder.ts src/features/chord-finder/useChordFinder.test.ts
git commit -m "feat: add useChordFinder hook with FFT-based chord detection"
```

---

### Task 3: Create `ChordFinderPage`

**Files:**
- Create: `src/features/chord-finder/ChordFinderPage.tsx`

- [ ] **Step 1: Create `src/features/chord-finder/ChordFinderPage.tsx`**

```typescript
import { useChordFinder } from './useChordFinder';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

export default function ChordFinderPage() {
  const { isListening, detectedNotes, chords, start, stop } = useChordFinder();

  const primaryChord = chords[0] ?? null;
  const alternativeChords = chords.slice(1, 4);

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Title with beta badge */}
      <div className="flex items-center justify-center gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">זיהוי אקורד</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
          בטא
        </span>
      </div>

      {/* Primary chord display */}
      <div className="text-center space-y-2">
        <div
          className={`
            text-6xl sm:text-8xl font-bold tracking-tight transition-all duration-300
            ${primaryChord ? 'text-foreground' : 'text-muted-foreground/30'}
          `}
          style={{ direction: 'ltr' }}
        >
          {primaryChord ?? '—'}
        </div>

        {alternativeChords.length > 0 && (
          <p className="text-sm text-muted-foreground" dir="ltr">
            {alternativeChords.join(' / ')}
          </p>
        )}
      </div>

      {/* Detected notes */}
      {detectedNotes.length > 0 && (
        <div className="flex justify-center gap-2 flex-wrap" dir="ltr">
          {detectedNotes.map((note) => (
            <span
              key={note}
              className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
            >
              {note}
            </span>
          ))}
        </div>
      )}

      {/* Start/Stop button */}
      <div className="flex justify-center">
        {isListening ? (
          <Button size="lg" variant="destructive" onClick={stop} className="gap-2">
            <MicOff className="h-5 w-5" />
            עצור
          </Button>
        ) : (
          <Button size="lg" onClick={start} className="gap-2">
            <Mic className="h-5 w-5" />
            התחל זיהוי
          </Button>
        )}
      </div>

      {/* Beta disclaimer */}
      <p className="text-center text-xs text-muted-foreground">
        תכונה בניסוי — הדיוק מוגבל
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors in `ChordFinderPage.tsx` (App.tsx may error until Task 4 wires the import — that's fine).

- [ ] **Step 3: Commit**

```bash
git add src/features/chord-finder/ChordFinderPage.tsx
git commit -m "feat: add ChordFinderPage UI"
```

---

### Task 4: Wire route and nav link

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: Add route to `src/App.tsx`**

Current `src/App.tsx` imports and routes look like this (read it to confirm line numbers before editing):

```typescript
import TunerPage from './features/tuner/TunerPage';
```
and
```tsx
<Route path="/tuner" element={<TunerPage />} />
```

Add the import after the TunerPage import:

```typescript
import ChordFinderPage from './features/chord-finder/ChordFinderPage';
```

Add the route after the tuner route:

```tsx
<Route path="/chord-finder" element={<ChordFinderPage />} />
```

- [ ] **Step 2: Add nav link to `src/components/Layout.tsx`**

The current tuner link in `Layout.tsx` is:

```tsx
<Link to="/tuner" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
  כיוון גיטרה
</Link>
```

Add the chord-finder link directly after it:

```tsx
<Link to="/chord-finder" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
  זיהוי אקורד<sup className="text-[10px] ml-0.5 opacity-60">β</sup>
</Link>
```

- [ ] **Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run all tests**

```bash
npm test
```

Expected: all tests pass (including the 5 new `frequencyToNoteName` tests).

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/Layout.tsx
git commit -m "feat: wire chord finder route and nav link"
```
