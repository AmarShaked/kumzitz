import { useState, useCallback, useRef, useEffect } from 'react';
import ChordDiagram from './ChordDiagram';
import { hasChordDiagram } from './chord-data';
import { hasUkuleleChord } from './ukulele-data';
import { hasPianoChord } from './piano-data';
import { useInstrument } from '@/hooks/useInstrument';

type TooltipState = { chord: string; x: number; y: number } | null;

export function useChordTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const { instrument } = useInstrument();

  const onChordHover = useCallback((chord: string, rect: DOMRect) => {
    const hasData =
      instrument === 'piano' ? hasPianoChord(chord) :
      instrument === 'ukulele' ? hasUkuleleChord(chord) :
      hasChordDiagram(chord);

    if (hasData) {
      setTooltip({ chord, x: rect.left + rect.width / 2, y: rect.top });
    }
  }, [instrument]);

  const onChordLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return { tooltip, onChordHover, onChordLeave };
}

export function ChordTooltipOverlay({ tooltip }: { tooltip: TooltipState }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!ref.current || !tooltip) return;
    // Use ResizeObserver to wait for the SVG to render and get final size
    const observer = new ResizeObserver(() => {
      if (!ref.current || !tooltip) return;
      const rect = ref.current.getBoundingClientRect();
      const x = Math.max(4, Math.min(tooltip.x - rect.width / 2, window.innerWidth - rect.width - 4));
      const y = tooltip.y - rect.height - 12;
      setPos({ x, y: Math.max(4, y) });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [tooltip]);

  if (!tooltip) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 pointer-events-none"
      style={{ left: pos.x, top: pos.y }}
    >
      <div className="bg-popover rounded-lg border border-border shadow-xl p-2">
        <ChordDiagram chord={tooltip.chord} />
      </div>
    </div>
  );
}
