import { useChordFinder } from './useChordFinder';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

export default function ChordFinderPage() {
  const { isListening, detectedNotes, chords, start, stop } = useChordFinder();

  const primaryChord = chords[0] ?? null;
  const alternativeChords = chords.slice(1, 4);

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Title with beta badge */}
      <div className="flex items-center justify-center gap-2">
        <h1 className="text-xl sm:text-2xl font-bold">זיהוי אקורד</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
          בטא
        </span>
      </div>

      {/* Primary chord display */}
      <div className="text-center space-y-2">
        <div
          className={`
            text-6xl sm:text-8xl font-bold tracking-tight transition-all duration-300
            ${primaryChord ? 'text-foreground' : 'text-muted-foreground/30'}
          `}
          style={{ direction: 'ltr' }}
        >
          {primaryChord ?? '—'}
        </div>

        {alternativeChords.length > 0 && (
          <p className="text-sm text-muted-foreground" dir="ltr">
            {alternativeChords.join(' / ')}
          </p>
        )}
      </div>

      {/* Detected notes */}
      {detectedNotes.length > 0 && (
        <div className="flex justify-center gap-2 flex-wrap" dir="ltr">
          {detectedNotes.map((note) => (
            <span
              key={note}
              className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium"
            >
              {note}
            </span>
          ))}
        </div>
      )}

      {/* Start/Stop button */}
      <div className="flex justify-center">
        {isListening ? (
          <Button size="lg" variant="destructive" onClick={stop} className="gap-2">
            <MicOff className="h-5 w-5" />
            עצור
          </Button>
        ) : (
          <Button size="lg" onClick={start} className="gap-2">
            <Mic className="h-5 w-5" />
            התחל זיהוי
          </Button>
        )}
      </div>

      {/* Beta disclaimer */}
      <p className="text-center text-xs text-muted-foreground">
        תכונה בניסוי — הדיוק מוגבל
      </p>
    </div>
  );
}
