# Ukulele Tuner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ukulele support to the tuner page with standard tuning (GCEA) and low-G tuning (G3CEA).

**Architecture:** Make `useTuner` accept a `strings` config array instead of using a hardcoded guitar constant. `TunerPage` manages instrument selection state, defines all three instrument configs, and passes the active config to `useTuner`. Switching instruments stops the tuner automatically.

**Tech Stack:** React, TypeScript, pitchfinder (YIN)

---

### Task 1: Make `useTuner` accept a `strings` parameter

**Files:**
- Modify: `src/features/tuner/useTuner.ts`

- [ ] **Step 1: Update the hook signature and type**

Replace the hardcoded `GUITAR_STRINGS` constant and make the hook accept strings as a parameter. Replace the full file contents of `src/features/tuner/useTuner.ts`:

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';
import { YIN } from 'pitchfinder';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export type TunerString = { note: string; octave: number; freq: number };

export type TunerState = {
  isListening: boolean;
  note: string | null;
  octave: number | null;
  frequency: number | null;
  cents: number; // -50 to +50, 0 = in tune
  closestString: TunerString | null;
  inTune: boolean;
};

function frequencyToNote(freq: number): { note: string; octave: number; cents: number } {
  const semitonesFromC0 = 12 * Math.log2(freq / 16.3516);
  const rounded = Math.round(semitonesFromC0);
  const cents = Math.round((semitonesFromC0 - rounded) * 100);
  const noteIndex = ((rounded % 12) + 12) % 12;
  const octave = Math.floor(rounded / 12);
  return { note: NOTE_NAMES[noteIndex], octave, cents };
}

function findClosestString(freq: number, strings: TunerString[]): TunerString {
  let closest = strings[0];
  let minDiff = Infinity;
  for (const s of strings) {
    const diff = Math.abs(freq - s.freq);
    if (diff < minDiff) {
      minDiff = diff;
      closest = s;
    }
  }
  return closest;
}

const IN_TUNE_THRESHOLD = 5;

export function useTuner(strings: TunerString[]) {
  const [state, setState] = useState<TunerState>({
    isListening: false,
    note: null,
    octave: null,
    frequency: null,
    cents: 0,
    closestString: null,
    inTune: false,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const detectPitchRef = useRef<ReturnType<typeof YIN> | null>(null);
  const stringsRef = useRef<TunerString[]>(strings);
  stringsRef.current = strings;

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
    setState((s) => ({ ...s, isListening: false, note: null, frequency: null, cents: 0, closestString: null, inTune: false }));
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      streamRef.current = stream;
      detectPitchRef.current = YIN({ sampleRate: ctx.sampleRate });

      setState((s) => ({ ...s, isListening: true }));

      const buffer = new Float32Array(analyser.fftSize);

      const tick = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(buffer);

        let rms = 0;
        for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i];
        rms = Math.sqrt(rms / buffer.length);

        if (rms < 0.01) {
          setState((s) => ({ ...s, note: null, frequency: null, cents: 0, closestString: null, inTune: false }));
          rafRef.current = requestAnimationFrame(tick);
          return;
        }

        const freq = detectPitchRef.current!(buffer);
        if (freq && freq > 60 && freq < 1200) {
          const { note, octave, cents } = frequencyToNote(freq);
          const closestString = findClosestString(freq, stringsRef.current);
          setState((s) => ({
            ...s,
            note,
            octave,
            frequency: Math.round(freq * 10) / 10,
            cents,
            closestString,
            inTune: Math.abs(cents) <= IN_TUNE_THRESHOLD,
          }));
        }

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

Key changes:
- Removed hardcoded `GUITAR_STRINGS` constant from the hook
- Added exported `TunerString` type
- `findClosestString` now takes a `strings` argument
- `useTuner` now takes a `strings: TunerString[]` parameter
- Added `stringsRef` so the tick closure always reads the latest strings without needing to restart

- [ ] **Step 2: Commit**

```bash
git add src/features/tuner/useTuner.ts
git commit -m "refactor: make useTuner accept strings config instead of hardcoded guitar strings"
```

---

### Task 2: Add instrument selector and ukulele configs to `TunerPage`

**Files:**
- Modify: `src/features/tuner/TunerPage.tsx`

- [ ] **Step 1: Rewrite TunerPage with instrument selector**

Replace the full file contents of `src/features/tuner/TunerPage.tsx`:

```typescript
import { useState } from 'react';
import { useTuner, type TunerString } from './useTuner';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

type Instrument = 'guitar' | 'ukulele' | 'ukulele-low-g';

const INSTRUMENT_CONFIGS: Record<Instrument, { label: string; title: string; strings: TunerString[] }> = {
  guitar: {
    label: 'גיטרה',
    title: 'כיוון גיטרה',
    strings: [
      { note: 'E', octave: 2, freq: 82.41 },
      { note: 'A', octave: 2, freq: 110.0 },
      { note: 'D', octave: 3, freq: 146.83 },
      { note: 'G', octave: 3, freq: 196.0 },
      { note: 'B', octave: 3, freq: 246.94 },
      { note: 'E', octave: 4, freq: 329.63 },
    ],
  },
  ukulele: {
    label: 'אוקולילה',
    title: 'כיוון אוקולילה',
    strings: [
      { note: 'G', octave: 4, freq: 392.0 },
      { note: 'C', octave: 4, freq: 261.63 },
      { note: 'E', octave: 4, freq: 329.63 },
      { note: 'A', octave: 4, freq: 440.0 },
    ],
  },
  'ukulele-low-g': {
    label: 'אוקולילה Low-G',
    title: 'כיוון אוקולילה (Low-G)',
    strings: [
      { note: 'G', octave: 3, freq: 196.0 },
      { note: 'C', octave: 4, freq: 261.63 },
      { note: 'E', octave: 4, freq: 329.63 },
      { note: 'A', octave: 4, freq: 440.0 },
    ],
  },
};

function NeedleGauge({ cents, active }: { cents: number; active: boolean }) {
  const rotation = active ? (cents / 50) * 45 : 0;
  const inTune = active && Math.abs(cents) <= 5;

  return (
    <div className="relative w-full max-w-64 h-auto mx-auto aspect-[2/1]">
      <svg viewBox="0 0 200 100" className="w-full h-full">
        {Array.from({ length: 21 }, (_, i) => {
          const angle = -90 + (i / 20) * 180;
          const rad = (angle * Math.PI) / 180;
          const isMajor = i % 5 === 0;
          const r1 = isMajor ? 72 : 76;
          const r2 = 82;
          return (
            <line
              key={i}
              x1={100 + r1 * Math.cos(rad)}
              y1={100 + r1 * Math.sin(rad)}
              x2={100 + r2 * Math.cos(rad)}
              y2={100 + r2 * Math.sin(rad)}
              className={i === 10 ? 'stroke-success' : 'stroke-muted-foreground/40'}
              strokeWidth={isMajor ? 2 : 1}
            />
          );
        })}

        <path
          d={`M ${100 + 82 * Math.cos((-99 * Math.PI) / 180)} ${100 + 82 * Math.sin((-99 * Math.PI) / 180)}
              A 82 82 0 0 1 ${100 + 82 * Math.cos((-81 * Math.PI) / 180)} ${100 + 82 * Math.sin((-81 * Math.PI) / 180)}`}
          fill="none"
          className="stroke-success/30"
          strokeWidth={6}
          strokeLinecap="round"
        />

        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: '100px 100px',
            transition: 'transform 0.15s ease-out',
          }}
        >
          <line
            x1={100}
            y1={100}
            x2={100}
            y2={20}
            className={inTune ? 'stroke-success' : active ? 'stroke-primary' : 'stroke-muted-foreground/30'}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </g>

        <circle cx={100} cy={100} r={4} className={inTune ? 'fill-success' : 'fill-muted-foreground/50'} />

        <text x={18} y={98} className="fill-muted-foreground text-[8px]" textAnchor="middle">-50</text>
        <text x={100} y={18} className="fill-success text-[8px]" textAnchor="middle">0</text>
        <text x={182} y={98} className="fill-muted-foreground text-[8px]" textAnchor="middle">+50</text>
      </svg>
    </div>
  );
}

function StringIndicator({ strings, activeNote, activeOctave }: {
  strings: TunerString[];
  activeNote: string | null;
  activeOctave: number | null;
}) {
  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {strings.map((s) => {
        const isActive = activeNote === s.note && activeOctave === s.octave;
        const label = `${s.note}${s.octave}`;
        return (
          <div
            key={label}
            className={`
              w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold
              transition-all duration-300
              ${isActive
                ? 'bg-primary text-primary-foreground scale-110 shadow-lg'
                : 'bg-secondary text-secondary-foreground'}
            `}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}

export default function TunerPage() {
  const [instrument, setInstrument] = useState<Instrument>('guitar');
  const config = INSTRUMENT_CONFIGS[instrument];
  const tuner = useTuner(config.strings);

  function handleInstrumentChange(next: Instrument) {
    if (tuner.isListening) tuner.stop();
    setInstrument(next);
  }

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <h1 className="text-xl sm:text-2xl font-bold text-center">{config.title}</h1>

      {/* Instrument selector */}
      <div className="flex justify-center gap-2" dir="rtl">
        {(Object.keys(INSTRUMENT_CONFIGS) as Instrument[]).map((key) => (
          <Button
            key={key}
            size="sm"
            variant={instrument === key ? 'default' : 'outline'}
            onClick={() => handleInstrumentChange(key)}
          >
            {INSTRUMENT_CONFIGS[key].label}
          </Button>
        ))}
      </div>

      {/* Note display */}
      <div className="text-center space-y-2">
        <div
          className={`
            text-6xl sm:text-8xl font-bold tracking-tight transition-all duration-300
            ${tuner.inTune ? 'text-success scale-110' : tuner.note ? 'text-foreground' : 'text-muted-foreground/30'}
          `}
          style={{ direction: 'ltr' }}
        >
          {tuner.note ?? '—'}
        </div>
        {tuner.frequency && (
          <p className="text-sm text-muted-foreground" dir="ltr">
            {tuner.frequency} Hz
          </p>
        )}
      </div>

      {/* Gauge */}
      <NeedleGauge cents={tuner.cents} active={!!tuner.note} />

      {/* Cents indicator */}
      <div className="text-center">
        <span
          className={`
            inline-block px-4 py-1 rounded-full text-sm font-medium transition-all duration-300
            ${tuner.inTune
              ? 'bg-success/20 text-success'
              : tuner.note
                ? tuner.cents > 0 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'}
          `}
        >
          {tuner.inTune ? 'מכוון!' : tuner.note ? (tuner.cents > 0 ? `גבוה +${tuner.cents}` : `נמוך ${tuner.cents}`) : 'נגן מיתר'}
        </span>
      </div>

      {/* String indicators */}
      <StringIndicator
        strings={config.strings}
        activeNote={tuner.note}
        activeOctave={tuner.octave}
      />

      {/* Start/Stop button */}
      <div className="flex justify-center">
        {tuner.isListening ? (
          <Button size="lg" variant="destructive" onClick={tuner.stop} className="gap-2">
            <MicOff className="h-5 w-5" />
            עצור
          </Button>
        ) : (
          <Button size="lg" onClick={tuner.start} className="gap-2">
            <Mic className="h-5 w-5" />
            התחל כיוון
          </Button>
        )}
      </div>

      {/* In-tune pulse animation */}
      {tuner.inTune && (
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-success animate-ping absolute" />
            <div className="w-4 h-4 rounded-full bg-success" />
          </div>
        </div>
      )}
    </div>
  );
}
```

Key changes:
- Added `Instrument` type and `INSTRUMENT_CONFIGS` record with all three instrument configs
- Instrument selector renders buttons for each instrument key
- `handleInstrumentChange` stops the tuner before switching
- Title dynamically comes from the active config
- `StringIndicator` uses `TunerString` type instead of the old `typeof GUITAR_STRINGS`
- `useTuner` called with `config.strings`

- [ ] **Step 2: Commit**

```bash
git add src/features/tuner/TunerPage.tsx
git commit -m "feat: add ukulele standard and low-G tuning with instrument selector"
```

---

### Task 3: Verify in browser

- [ ] **Step 1: Run the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Navigate to `/tuner` and verify**

Check:
1. Three buttons appear: גיטרה, אוקולילה, אוקולילה Low-G
2. Guitar selected by default — 6 string bubbles (E2 A2 D3 G3 B3 E4), title "כיוון גיטרה"
3. Switch to Ukulele — 4 string bubbles (G4 C4 E4 A4), title "כיוון אוקולילה"
4. Switch to Ukulele Low-G — 4 string bubbles (G3 C4 E4 A4), title "כיוון אוקולילה (Low-G)"
5. Starting the tuner and then switching instrument stops it cleanly
6. String bubble highlights when the detected note+octave matches
