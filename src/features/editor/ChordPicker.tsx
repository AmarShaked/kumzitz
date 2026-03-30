import { useState } from 'react';
import { Button } from '@/components/ui/button';

const ROOTS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const ACCIDENTALS = [
  { label: '♮', value: '' },
  { label: '#', value: '#' },
  { label: 'b', value: 'b' },
];

const QUALITIES = [
  { label: 'Major', value: '' },
  { label: 'm', value: 'm' },
  { label: '7', value: '7' },
  { label: 'm7', value: 'm7' },
  { label: 'maj7', value: 'maj7' },
  { label: 'dim', value: 'dim' },
  { label: 'aug', value: 'aug' },
  { label: 'sus2', value: 'sus2' },
  { label: 'sus4', value: 'sus4' },
  { label: '6', value: '6' },
  { label: 'm6', value: 'm6' },
  { label: '9', value: '9' },
  { label: 'add9', value: 'add9' },
  { label: '5', value: '5' },
];

type ChordPickerProps = {
  onSelect: (chord: string) => void;
};

export default function ChordPicker({ onSelect }: ChordPickerProps) {
  const [root, setRoot] = useState<string | null>(null);
  const [accidental, setAccidental] = useState('');

  const handleQualitySelect = (quality: string) => {
    if (!root) return;
    onSelect(`${root}${accidental}${quality}`);
    setRoot(null);
    setAccidental('');
  };

  const handleReset = () => {
    setRoot(null);
    setAccidental('');
  };

  return (
    <div className="absolute top-full mt-1 z-40 rounded-lg bg-popover border border-border p-3 shadow-xl w-72">
      {!root ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">בחר שורש</p>
          <div className="grid grid-cols-7 gap-1">
            {ROOTS.map((r) => (
              <Button key={r} variant="secondary" size="sm" onClick={() => setRoot(r)}
                className="px-2 py-1 text-sm font-mono font-bold">
                {r}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-medium">
              שורש: <span className="text-foreground font-bold font-mono">{root}{accidental}</span>
            </p>
            <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">חזרה</button>
          </div>
          <div className="flex gap-1">
            {ACCIDENTALS.map((a) => (
              <Button key={a.label} size="sm"
                variant={accidental === a.value ? 'default' : 'secondary'}
                onClick={() => setAccidental(a.value)}
                className="px-3 py-1 text-sm font-mono">
                {a.label}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1">
            {QUALITIES.map((q) => (
              <Button key={q.value} variant="secondary" size="sm"
                onClick={() => handleQualitySelect(q.value)}
                className="px-1 py-1 text-xs font-mono">
                {root}{accidental}{q.label || ''}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
