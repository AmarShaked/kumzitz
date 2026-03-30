import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSongList, useCreateSong } from './hooks/useSongs';
import SongCard from './SongCard';
import { parseDirectives } from '../../lib/chordpro';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Song } from '../../types/song';

export default function SongListPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useSongList(search || undefined);
  const navigate = useNavigate();
  const { mutateAsync: create } = useCreateSong();
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const chordproInputRef = useRef<HTMLInputElement>(null);

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text) as Partial<Song>;
    const created = await create({
      title: data.title ?? 'ללא שם',
      artist: data.artist ?? 'לא ידוע',
      content: data.content ?? '',
      originalKey: data.originalKey ?? '',
      bpm: data.bpm ?? null,
      isPublic: data.isPublic ?? true,
    });
    navigate(`/song/${created.id}`);
  };

  const handleImportChordPro = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const { directives, content } = parseDirectives(text);
    const created = await create({
      title: directives.title ?? file.name.replace('.chordpro', ''),
      artist: directives.artist ?? 'לא ידוע',
      content,
      originalKey: directives.key ?? '',
      bpm: null,
      isPublic: true,
    });
    navigate(`/song/${created.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <Input type="search" placeholder="חפש שיר או אמן..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        className="h-12" />
      <div className="flex gap-2">
        <input ref={jsonInputRef} type="file" accept=".json" onChange={handleImportJson} className="hidden" />
        <input ref={chordproInputRef} type="file" accept=".chordpro,.cho,.crd" onChange={handleImportChordPro} className="hidden" />
        <Button variant="secondary" size="sm" onClick={() => jsonInputRef.current?.click()}>ייבוא JSON</Button>
        <Button variant="secondary" size="sm" onClick={() => chordproInputRef.current?.click()}>ייבוא ChordPro</Button>
      </div>
      {isLoading && <p className="text-center text-muted-foreground">טוען...</p>}
      {error && <p className="text-center text-destructive">שגיאה בטעינת שירים</p>}
      <div className="grid gap-3">
        {data?.items.map((song) => <SongCard key={song.id} song={song} />)}
      </div>
      {data?.items.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground">לא נמצאו שירים</p>
      )}
    </div>
  );
}
