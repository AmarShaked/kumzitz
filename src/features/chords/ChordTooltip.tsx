import { useState, useCallback } from 'react';
import ChordDiagram from './ChordDiagram';
import { hasChordDiagram } from './chord-data';

type TooltipState = { chord: string; x: number; y: number } | null;

export function useChordTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const onChordHover = useCallback((chord: string, rect: DOMRect) => {
    if (hasChordDiagram(chord)) {
      setTooltip({ chord, x: rect.left + rect.width / 2, y: rect.top });
    }
  }, []);

  const onChordLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return { tooltip, onChordHover, onChordLeave };
}

export function ChordTooltipOverlay({ tooltip }: { tooltip: TooltipState }) {
  if (!tooltip) return null;

  return (
    <div className="fixed z-50 pointer-events-none"
      style={{ left: tooltip.x - 80, top: tooltip.y - 200 }}>
      <div className="bg-popover rounded-lg border border-border shadow-xl p-2">
        <ChordDiagram chord={tooltip.chord} width={160} />
      </div>
    </div>
  );
}
