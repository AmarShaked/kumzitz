import { useState, useEffect, useRef, useCallback } from 'react';
import SongRenderer from '../../components/SongRenderer';
import TransposeControls from '../transpose/TransposeControls';
import { Button } from '@/components/ui/button';

type PerformanceModeProps = {
  title: string;
  content: string;
  originalKey?: string;
  /** Chords as chosen on the song page (transpose / 4 chords / easy shapes). */
  mapChord?: (chord: string) => string;
  /** Active modes from the song page, e.g. ["3 אקורדים", "קאפו 5"]: shown so you know
   *  what you're looking at (and remember the capo). */
  modes?: string[];
  onExit: () => void;
};

export default function PerformanceMode({ title, content, originalKey, mapChord, modes = [], onExit }: PerformanceModeProps) {
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(() => {
    return Number(localStorage.getItem('kumzitz-perf-font-size')) || 24;
  });
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    localStorage.setItem('kumzitz-perf-font-size', String(fontSize));
  }, [fontSize]);

  // Fullscreen + Wake Lock
  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});

    // Keep screen on
    navigator.wakeLock?.request('screen').then((lock) => {
      wakeLockRef.current = lock;
    }).catch(() => {});

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
      wakeLockRef.current?.release().catch(() => {});
      wakeLockRef.current = null;
    };
  }, []);

  const scroll = useCallback(() => {
    if (!containerRef.current || !isScrolling) return;
    containerRef.current.scrollTop += scrollSpeed * 0.5;
    animationRef.current = requestAnimationFrame(scroll);
  }, [isScrolling, scrollSpeed]);

  useEffect(() => {
    if (isScrolling && scrollSpeed > 0) {
      animationRef.current = requestAnimationFrame(scroll);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isScrolling, scrollSpeed, scroll]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onExit]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-card border-b border-border shrink-0 gap-2 flex-wrap">
        <h2 className="text-base sm:text-xl font-bold truncate max-w-[40%]">{title}</h2>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {modes.map((m) => (
            <span key={m} className="rounded-md bg-chord/20 text-chord px-2 py-1 text-sm font-bold">{m}</span>
          ))}
          {!mapChord && <TransposeControls transpose={transpose} onTransposeChange={setTranspose} originalKey={originalKey} />}
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="icon" className="w-8 h-8"
              onClick={() => setFontSize((s) => Math.max(14, s - 2))}>א-</Button>
            <Button variant="secondary" size="icon" className="w-8 h-8"
              onClick={() => setFontSize((s) => Math.min(48, s + 2))}>א+</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isScrolling ? 'success' : 'secondary'}
              size="sm"
              onClick={() => {
                if (isScrolling) { setIsScrolling(false); }
                else { setIsScrolling(true); if (scrollSpeed === 0) setScrollSpeed(1); }
              }}>
              {isScrolling ? 'עצור' : 'גלילה'}
            </Button>
            {isScrolling && (
              <input type="range" min="0.5" max="5" step="0.5" value={scrollSpeed}
                onChange={(e) => setScrollSpeed(Number(e.target.value))} className="w-16 sm:w-20" />
            )}
          </div>
          <Button variant="destructive" size="sm" onClick={onExit}>יציאה</Button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto p-4 sm:p-8">
        <SongRenderer content={content} transpose={mapChord ? 0 : transpose} mapChord={mapChord} fontSize={fontSize} />
      </div>
    </div>
  );
}
