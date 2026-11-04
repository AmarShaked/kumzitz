import ChordDiagram from './ChordDiagram';
import { hasChordDiagram } from './chord-data';
import { hasUkuleleChord } from './ukulele-data';
import { hasPianoChord } from './piano-data';
import { useInstrument } from '@/hooks/useInstrument';
import { simplifyChord } from '@/lib/transpose';

/** Every chord you need for the song, with its shape, always in view. */
export default function ChordStrip({ chords, title }: { chords: string[]; title: string }) {
  const { instrument } = useInstrument();
  const has = (c: string) =>
    instrument === 'piano' ? hasPianoChord(c) : instrument === 'ukulele' ? hasUkuleleChord(c) : hasChordDiagram(c);
  if (!chords.length) return null;

  return (
    <section aria-label={title} className="space-y-2 print:hidden">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <div className="flex gap-2 overflow-x-auto pb-1" dir="ltr">
        {chords.map((c) => {
          // no diagram for e.g. C6 / Dsus2: show the basic shape and say so
          const shape = has(c) ? c : has(simplifyChord(c)) ? simplifyChord(c) : null;
          return (
          <div key={c} className="shrink-0 rounded-lg border border-border bg-card px-1 pt-1 min-w-[88px] text-center">
            {shape ? (
              <>
                {(instrument === 'piano' || shape !== c) && (
                  <div className="text-base font-bold text-chord pt-1">
                    {c}{shape !== c && <span className="text-xs font-normal text-muted-foreground"> ≈ {shape}</span>}
                  </div>
                )}
                <ChordDiagram chord={shape} width={instrument === 'piano' ? 120 : 84} />
              </>
            ) : (
              <div className="py-6 px-2">
                <div className="text-lg font-bold text-chord">{c}</div>
                <div className="text-[11px] text-muted-foreground">אין תרשים</div>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </section>
  );
}
