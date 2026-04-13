import { useEffect, useRef, useState, useCallback } from 'react';
import { Chord } from 'tonal';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function frequencyToNoteName(freq: number): string {
  const semitonesFromC0 = 12 * Math.log2(freq / 16.3516);
  const rounded = Math.round(semitonesFromC0);
  const noteIndex = ((rounded % 12) + 12) % 12;
  return NOTE_NAMES[noteIndex];
}

function detectNotes(analyser: AnalyserNode, dataArray: Float32Array<ArrayBuffer>): string[] {
  analyser.getFloatFrequencyData(dataArray);
  const bufferLength = analyser.frequencyBinCount;

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
  error: string | null;
};

export function useChordFinder() {
  const [state, setState] = useState<ChordFinderState>({
    isListening: false,
    detectedNotes: [],
    chords: [],
    error: null,
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
    setState({ isListening: false, detectedNotes: [], chords: [], error: null });
  }, []);

  const start = useCallback(async () => {
    if (audioContextRef.current) return;
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

      setState((s) => ({ ...s, isListening: true, error: null }));

      const timeBuffer = new Float32Array(analyser.fftSize);
      const dataArray = new Float32Array(analyser.frequencyBinCount);

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

        const notes = detectNotes(analyserRef.current, dataArray);
        const chords = notes.length >= 2 ? Chord.detect(notes) : [];
        setState((s) => ({ ...s, detectedNotes: notes, chords }));

        rafRef.current = requestAnimationFrame(tick);
      };

      tick();
    } catch {
      setState((s) => ({ ...s, isListening: false, error: 'לא ניתן לגשת למיקרופון' }));
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
