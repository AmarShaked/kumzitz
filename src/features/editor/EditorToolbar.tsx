import { useState } from 'react';
import { useEditor } from './EditorProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ChordPicker from './ChordPicker';
import Tab4uImport from './Tab4uImport';

import { KEY_NAMES } from '../../lib/simplify';

const KEYS = KEY_NAMES; // all 24 keys, spelled like the importer names them

export default function EditorToolbar() {
  const { state, setTitle, setArtist, setOriginalKey, setBpm, insertChordAtCursor } = useEditor();
  const [chordPickerOpen, setChordPickerOpen] = useState(false);

  return (
    <div className="space-y-3 rounded-lg bg-card p-3 sm:p-4 border border-border">
      <Tab4uImport />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input type="text" placeholder="שם השיר" value={state.title} onChange={(e) => setTitle(e.target.value)} />
        <Input type="text" placeholder="שם האמן" value={state.artist} onChange={(e) => setArtist(e.target.value)} />
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <select value={state.originalKey} onChange={(e) => setOriginalKey(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <option value="">סולם</option>
          {(KEYS.includes(state.originalKey) || !state.originalKey ? KEYS : [state.originalKey, ...KEYS])
            .map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <Input type="number" placeholder="BPM" value={state.bpm} onChange={(e) => setBpm(e.target.value)} className="w-20" />
        <div className="relative">
          <Button size="sm" onClick={() => setChordPickerOpen(!chordPickerOpen)}>
            הוסף אקורד
          </Button>
          {chordPickerOpen && (
            <ChordPicker onSelect={(chord) => { insertChordAtCursor(chord); setChordPickerOpen(false); }} />
          )}
        </div>
      </div>
    </div>
  );
}
