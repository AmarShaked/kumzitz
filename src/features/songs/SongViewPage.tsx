import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSong, useDeleteSong } from './hooks/useSongs';
import SongRenderer from '../../components/SongRenderer';
import TransposeControls from '../transpose/TransposeControls';
import { useChordTooltip, ChordTooltipOverlay } from '../chords/ChordTooltip';
import { pb } from '../../services/pocketbase';
import PerformanceMode from '../performance/PerformanceMode';
import { Button } from '@/components/ui/button';
import { parseChordPro } from '../../lib/chordpro';
import { findEasiestTranspose } from '../../lib/transpose';
import { Settings } from 'lucide-react';

export default function SongViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: song, isLoading, error } = useSong(id!);
  const { mutateAsync: removeSong } = useDeleteSong();
  const [transpose, setTranspose] = useState(0);
  const [simplified, setSimplified] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const { tooltip, onChordHover, onChordLeave } = useChordTooltip();
  const [performanceMode, setPerformanceMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const allChords = useMemo(() => {
    if (!song) return [];
    const lines = parseChordPro(song.content);
    return lines.flatMap((l) => l.segments.map((s) => s.chord).filter(Boolean)) as string[];
  }, [song]);

  useEffect(() => {
    if (!settingsOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [settingsOpen]);

  if (isLoading) return <p className="p-8 text-center text-muted-foreground">טוען...</p>;
  if (error || !song) return <p className="p-8 text-center text-destructive">השיר לא נמצא</p>;

  const isAuthor = pb.authStore.record?.id === song.author;

  const handleSimplify = () => {
    if (simplified) {
      setSimplified(false);
      setTranspose(0);
    } else {
      const best = findEasiestTranspose(allChords);
      setTranspose(best);
      setSimplified(true);
    }
  };

  const handleDelete = async () => {
    if (confirm('למחוק את השיר?')) {
      await removeSong(song.id);
      navigate('/');
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(song, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportChordPro = () => {
    const header = `{title: ${song.title}}\n{artist: ${song.artist}}\n{key: ${song.originalKey}}\n`;
    const blob = new Blob([header + song.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.title}.chordpro`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
    {performanceMode && (
      <PerformanceMode
        title={song.title}
        content={song.content}
        originalKey={song.originalKey}
        onExit={() => setPerformanceMode(false)}
      />
    )}
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 print:song-wrap">
      <div className="flex items-start justify-between print:song-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold print:text-xl print:mb-0">{song.title}</h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-1 print:text-sm print:mt-0 print:text-black/60">{song.artist}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground print:hidden">
            {song.originalKey && <span>סולם: {song.originalKey}</span>}
            {song.bpm && <span>BPM: {song.bpm}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          {isAuthor && (
            <>
              <Button variant="secondary" size="sm" asChild>
                <Link to={`/song/${song.id}/edit`}>עריכה</Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>מחיקה</Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap print:hidden">
        <TransposeControls transpose={transpose} onTransposeChange={setTranspose} originalKey={song.originalKey} />
        <Button variant={simplified ? 'default' : 'secondary'} size="sm" onClick={handleSimplify}>
          {simplified ? 'ביטול פישוט' : 'פשט אקורדים'}
        </Button>
        <Button variant="secondary" size="sm" className="hidden sm:inline-flex" onClick={() => window.print()}>הדפסה</Button>
        <Button variant="secondary" size="sm" onClick={() => setPerformanceMode(true)}>מצב הופעה</Button>

        <div className="relative" ref={settingsRef}>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSettingsOpen(!settingsOpen)}>
            <Settings className="h-4 w-4" />
          </Button>
          {settingsOpen && (
            <div className="absolute top-full mt-1 end-0 z-40 rounded-lg bg-popover border border-border p-4 shadow-xl w-56 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">גודל גופן</p>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" className="h-7 w-7 p-0"
                    onClick={() => setFontSize((s) => Math.max(12, s - 2))}>-</Button>
                  <span className="text-sm min-w-[32px] text-center">{fontSize}</span>
                  <Button variant="secondary" size="sm" className="h-7 w-7 p-0"
                    onClick={() => setFontSize((s) => Math.min(32, s + 2))}>+</Button>
                </div>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">ייצוא</p>
                <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => { handleExportJson(); setSettingsOpen(false); }}>
                  ייצוא JSON
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start" onClick={() => { handleExportChordPro(); setSettingsOpen(false); }}>
                  ייצוא ChordPro
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg bg-muted/30 p-4 sm:p-6">
        <SongRenderer content={song.content} transpose={transpose} simplify={simplified} fontSize={fontSize} onChordHover={onChordHover} onChordLeave={onChordLeave} />
      </div>
      <ChordTooltipOverlay tooltip={tooltip} />
    </div>
    </>
  );
}
