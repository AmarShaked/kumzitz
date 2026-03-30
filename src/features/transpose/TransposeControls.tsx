import { transposeChord } from '../../lib/transpose';
import { Button } from '@/components/ui/button';

type TransposeControlsProps = {
  transpose: number;
  onTransposeChange: (value: number) => void;
  originalKey?: string;
};

function getCapoFret(transpose: number): number {
  return ((transpose % 12) + 12) % 12;
}

export default function TransposeControls({ transpose, onTransposeChange, originalKey }: TransposeControlsProps) {
  const currentKey = originalKey && transpose !== 0 ? transposeChord(originalKey, transpose) : originalKey;
  const capo = transpose !== 0 ? getCapoFret(transpose) : 0;

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="icon" onClick={() => onTransposeChange(transpose - 1)} className="w-8 h-8 text-lg font-bold">-</Button>
      <span className="text-sm text-foreground min-w-[60px] text-center">
        {currentKey ?? '—'}
        {transpose !== 0 && <span className="text-muted-foreground text-xs block">{transpose > 0 ? `+${transpose}` : transpose}</span>}
      </span>
      <Button variant="secondary" size="icon" onClick={() => onTransposeChange(transpose + 1)} className="w-8 h-8 text-lg font-bold">+</Button>
      {transpose !== 0 && (
        <>
          {capo > 0 && (
            <span className="text-xs text-chord font-medium">
              קאפו {capo}
            </span>
          )}
          <button onClick={() => onTransposeChange(0)} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">איפוס</button>
        </>
      )}
    </div>
  );
}
