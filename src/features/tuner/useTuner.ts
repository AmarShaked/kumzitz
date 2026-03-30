import { useEffect, useRef, useState, useCallback } from 'react';
import { YIN } from 'pitchfinder';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const GUITAR_STRINGS = [
  { note: 'E', octave: 2, freq: 82.41 },
  { note: 'A', octave: 2, freq: 110.0 },
  { note: 'D', octave: 3, freq: 146.83 },
  { note: 'G', octave: 3, freq: 196.0 },
  { note: 'B', octave: 3, freq: 246.94 },
  { note: 'E', octave: 4, freq: 329.63 },
];

export type TunerState = {
  isListening: boolean;
  note: string | null;
  octave: number | null;
  frequency: number | null;
  cents: number; // -50 to +50, 0 = in tune
  closestString: typeof GUITAR_STRINGS[number] | null;
  inTune: boolean;
};

function frequencyToNote(freq: number): { note: string; octave: number; cents: number } {
  // Semitones from C0 (16.35 Hz)
  const semitonesFromC0 = 12 * Math.log2(freq / 16.3516);
  const rounded = Math.round(semitonesFromC0);
  const cents = Math.round((semitonesFromC0 - rounded) * 100);
  const noteIndex = ((rounded % 12) + 12) % 12;
  const octave = Math.floor(rounded / 12);
  return { note: NOTE_NAMES[noteIndex], octave, cents };
}

function findClosestString(freq: number) {
  let closest = GUITAR_STRINGS[0];
  let minDiff = Infinity;
  for (const s of GUITAR_STRINGS) {
    const diff = Math.abs(freq - s.freq);
    if (diff < minDiff) {
      minDiff = diff;
      closest = s;
    }
  }
  return closest;
}

const IN_TUNE_THRESHOLD = 5;

export function useTuner() {
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

        // Check if there's enough signal
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
          const closestString = findClosestString(freq);
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
