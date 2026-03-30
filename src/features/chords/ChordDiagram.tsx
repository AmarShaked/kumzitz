import { useEffect, useRef } from 'react';
import { SVGuitarChord } from 'svguitar';
import { getChordSettings } from './chord-data';
import { getUkuleleChordSettings } from './ukulele-data';
import PianoDiagram from './PianoDiagram';
import { useTheme } from '@/hooks/useTheme';
import { useInstrument } from '@/hooks/useInstrument';

type ChordDiagramProps = { chord: string; width?: number };

export default function ChordDiagram({ chord, width }: ChordDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { instrument } = useInstrument();

  const resolvedWidth = width ?? (instrument === 'ukulele' ? 110 : 160);

  useEffect(() => {
    if (!containerRef.current || instrument === 'piano') return;

    const isUke = instrument === 'ukulele';
    const settings = isUke ? getUkuleleChordSettings(chord) : getChordSettings(chord);
    if (!settings) {
      containerRef.current.innerHTML = '';
      return;
    }

    containerRef.current.innerHTML = '';
    const isDark = theme === 'dark';

    const chart = new SVGuitarChord(containerRef.current)
      .chord(settings as any)
      .configure({
        title: chord,
        strings: isUke ? 4 : 6,
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
  }, [chord, theme, instrument]);

  if (instrument === 'piano') {
    return <PianoDiagram chord={chord} width={resolvedWidth} />;
  }

  return <div ref={containerRef} style={{ width: resolvedWidth }} />;
}
