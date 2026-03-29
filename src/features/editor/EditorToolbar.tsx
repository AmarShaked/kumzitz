import { useState } from 'react';
import { useEditor } from './EditorProvider';

const COMMON_CHORDS = [
  'C', 'D', 'E', 'F', 'G', 'A', 'B',
  'Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm',
  'C7', 'D7', 'E7', 'G7', 'A7', 'B7',
];

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
              'Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm'];

export default function EditorToolbar() {
  const { state, setTitle, setArtist, setOriginalKey, setBpm, setIsPublic, insertChordAtCursor } = useEditor();
  const [chordDropdownOpen, setChordDropdownOpen] = useState(false);

  return (
    <div className="space-y-3 rounded-lg bg-gray-800 p-4">
      <div className="grid grid-cols-2 gap-3">
        <input type="text" placeholder="שם השיר" value={state.title} onChange={(e) => setTitle(e.target.value)}
          className="rounded bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
        <input type="text" placeholder="שם האמן" value={state.artist} onChange={(e) => setArtist(e.target.value)}
          className="rounded bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <select value={state.originalKey} onChange={(e) => setOriginalKey(e.target.value)}
          className="rounded bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">סולם</option>
          {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <input type="number" placeholder="BPM" value={state.bpm} onChange={(e) => setBpm(e.target.value)}
          className="w-20 rounded bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input type="checkbox" checked={state.isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="rounded" />
          ציבורי
        </label>
        <div className="relative">
          <button onClick={() => setChordDropdownOpen(!chordDropdownOpen)}
            className="rounded bg-blue-600 px-3 py-2 text-sm font-medium hover:bg-blue-700">
            הוסף אקורד
          </button>
          {chordDropdownOpen && (
            <div className="absolute top-full mt-1 z-40 rounded-lg bg-gray-700 border border-gray-600 p-3 shadow-xl grid grid-cols-7 gap-1 w-80">
              {COMMON_CHORDS.map((chord) => (
                <button key={chord} onClick={() => { insertChordAtCursor(chord); setChordDropdownOpen(false); }}
                  className="rounded bg-gray-800 px-2 py-1 text-xs hover:bg-gray-600 font-mono">
                  {chord}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
