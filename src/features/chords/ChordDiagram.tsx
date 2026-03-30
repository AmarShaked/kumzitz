import { useEffect, useRef } from 'react';
import { SVGuitarChord } from 'svguitar';
import { getChordSettings } from './chord-data';
import { useTheme } from '@/hooks/useTheme';

type ChordDiagramProps = { chord: string; width?: number };

export default function ChordDiagram({ chord, width = 160 }: ChordDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;
    const settings = getChordSettings(chord);
    if (!settings) return;

    containerRef.current.innerHTML = '';

    const isDark = theme === 'dark';

    const chart = new SVGuitarChord(containerRef.current)
      .chord(settings as any)
      .configure({
        title: chord,
        strings: 6,
        frets: 5,
        color: isDark ? '#e8e2dc' : '#3d3530',
        backgroundColor: 'transparent',
        titleColor: isDark ? '#ceb89f' : '#9f8e7f',
        stringColor: isDark ? '#a8a59a' : '#c4bab2',
        fretColor: isDark ? '#a8a59a' : '#c4bab2',
        fingerColor: isDark ? '#ceb89f' : '#9f8e7f',
        barreChordRadius: 0.3,
      } as any);

    chart.draw();
  }, [chord, theme]);

  return <div ref={containerRef} style={{ width }} />;
}
