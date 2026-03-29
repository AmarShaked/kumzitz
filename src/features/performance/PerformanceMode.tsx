import { useState, useEffect, useRef, useCallback } from 'react';
import SongRenderer from '../../components/SongRenderer';
import TransposeControls from '../transpose/TransposeControls';

type PerformanceModeProps = {
  title: string;
  content: string;
  originalKey?: string;
  onExit: () => void;
};

export default function PerformanceMode({ title, content, originalKey, onExit }: PerformanceModeProps) {
  const [transpose, setTranspose] = useState(0);
  const [fontSize, setFontSize] = useState(() => {
    return Number(localStorage.getItem('kumzitz-perf-font-size')) || 24;
  });
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    localStorage.setItem('kumzitz-perf-font-size', String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    document.documentElement.requestFullscreen?.().catch(() => {});
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
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
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex items-center gap-4">
          <TransposeControls transpose={transpose} onTransposeChange={setTranspose} originalKey={originalKey} />
          <div className="flex items-center gap-1">
            <button onClick={() => setFontSize((s) => Math.max(14, s - 2))}
              className="rounded bg-gray-700 w-8 h-8 flex items-center justify-center hover:bg-gray-600 text-sm">א-</button>
            <button onClick={() => setFontSize((s) => Math.min(48, s + 2))}
              className="rounded bg-gray-700 w-8 h-8 flex items-center justify-center hover:bg-gray-600 text-sm">א+</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => {
                if (isScrolling) { setIsScrolling(false); }
                else { setIsScrolling(true); if (scrollSpeed === 0) setScrollSpeed(1); }
              }}
              className={`rounded px-3 py-1 text-sm ${isScrolling ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
              {isScrolling ? 'עצור' : 'גלילה'}
            </button>
            {isScrolling && (
              <input type="range" min="0.5" max="5" step="0.5" value={scrollSpeed}
                onChange={(e) => setScrollSpeed(Number(e.target.value))} className="w-20" />
            )}
          </div>
          <button onClick={onExit} className="rounded bg-red-800 px-3 py-1 text-sm hover:bg-red-700">יציאה</button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-auto p-8">
        <SongRenderer content={content} transpose={transpose} fontSize={fontSize} />
      </div>
    </div>
  );
}
