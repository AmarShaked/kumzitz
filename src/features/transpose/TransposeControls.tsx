import { transposeChord } from '../../lib/transpose';

type TransposeControlsProps = {
  transpose: number;
  onTransposeChange: (value: number) => void;
  originalKey?: string;
};

export default function TransposeControls({ transpose, onTransposeChange, originalKey }: TransposeControlsProps) {
  const currentKey = originalKey && transpose !== 0 ? transposeChord(originalKey, transpose) : originalKey;

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onTransposeChange(transpose - 1)}
        className="rounded bg-gray-700 w-8 h-8 flex items-center justify-center hover:bg-gray-600 text-lg font-bold">-</button>
      <span className="text-sm text-gray-300 min-w-[60px] text-center">
        {currentKey ?? '—'}
        {transpose !== 0 && <span className="text-gray-500 text-xs block">{transpose > 0 ? `+${transpose}` : transpose}</span>}
      </span>
      <button onClick={() => onTransposeChange(transpose + 1)}
        className="rounded bg-gray-700 w-8 h-8 flex items-center justify-center hover:bg-gray-600 text-lg font-bold">+</button>
      {transpose !== 0 && <button onClick={() => onTransposeChange(0)} className="text-xs text-gray-500 hover:text-gray-300">איפוס</button>}
    </div>
  );
}
