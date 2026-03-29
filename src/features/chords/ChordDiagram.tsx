import { useEffect, useRef } from 'react';
import { SVGuitarChord } from 'svguitar';
import { getChordSettings } from './chord-data';

type ChordDiagramProps = { chord: string; width?: number };

export default function ChordDiagram({ chord, width = 160 }: ChordDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const settings = getChordSettings(chord);
    if (!settings) return;

    containerRef.current.innerHTML = '';

    const chart = new SVGuitarChord(containerRef.current)
      .chord(settings as any)
      .configure({
        title: chord,
        strings: 6,
        frets: 5,
        color: '#e2e8f0',
        backgroundColor: 'transparent',
        titleColor: '#60a5fa',
        stringColor: '#64748b',
        fretColor: '#64748b',
        fingerColor: '#3b82f6',
        barreChordRadius: 0.3,
      } as any);

    chart.draw();
  }, [chord]);

  return <div ref={containerRef} style={{ width }} />;
}
