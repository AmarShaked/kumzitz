import { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSong, useDeleteSong } from './hooks/useSongs';
import SongRenderer from '../../components/SongRenderer';
import TransposeControls from '../transpose/TransposeControls';
import { useChordTooltip, ChordTooltipOverlay } from '../chords/ChordTooltip';
import PerformanceMode from '../performance/PerformanceMode';
import { Button } from '@/components/ui/button';
import { parseChordPro } from '../../lib/chordpro';
import { buildChordMapper } from '../../lib/simplify';
import ChordStrip from '../chords/ChordStrip';
import { Settings } from 'lucide-react';
import { useInstrument, type Instrument } from '@/hooks/useInstrument';

const INSTRUMENTS: { value: Instrument; label: string }[] = [
  { value: 'guitar', label: 'גיטרה' },
  { value: 'ukulele', label: 'יוקולילי' },
  { value: 'piano', label: 'פסנתר' },
];

// Keep left-to-right labels (1·4·5, I · IV · V) in order inside Hebrew text.
const ltr = (text: string) => `\u2066${text}\u2069`;

export default function SongViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: song, isLoading, error } = useSong(id!);
  const { mutateAsync: removeSong } = useDeleteSong();
  const [transpose, setTranspose] = useState(0);
  const [three, setThree] = useState(() => localStorage.getItem('kumzitz-three') === '1');
  const [easy, setEasy] = useState(() => localStorage.getItem('kumzitz-easy') === '1');
  const [fontSize, setFontSize] = useState(18);
  const { tooltip, onChordHover, onChordLeave } = useChordTooltip();
  const [performanceMode, setPerformanceMode] = useState(false);
  const { instrument, setInstrument } = useInstrument();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const songContentRef = useRef<HTMLDivElement>(null);

  const allChords = useMemo(() => {
    if (!song) return [];
    const lines = parseChordPro(song.content);
    return lines.flatMap((l) => l.segments.map((s) => s.chord).filter(Boolean)) as string[];
  }, [song]);

  useEffect(() => {
    return () => { wakeLock?.release().catch(() => {}); };
  }, [wakeLock]);

  // remember the player's preference across songs
  useEffect(() => {
    try {
      localStorage.setItem('kumzitz-three', three ? '1' : '0');
      localStorage.setItem('kumzitz-easy', easy ? '1' : '0');
    } catch { /* storage blocked */ }
  }, [three, easy]);

  const mapper = useMemo(
    () => buildChordMapper(allChords, { transpose, three, easy, instrument }),
    [allChords, transpose, three, easy, instrument],
  );

  // the chords you'll play, in the order they first appear
  const shownChords = useMemo(() => {
    const seen: string[] = [];
    for (const c of allChords) {
      const m = mapper.map(c);
      if (!seen.includes(m)) seen.push(m);
    }
    return seen;
  }, [allChords, mapper]);

  // piano: say which key it moved to (you sing in that key), as a signed shift −6…+5
  const signedShift = mapper.keyShift > 6 ? mapper.keyShift - 12 : mapper.keyShift;
  const easyBadge = !easy ? ''
    : instrument !== 'piano' ? (mapper.capo ? `קאפו ${mapper.capo}` : 'בלי קאפו')
    : mapper.easyKey ? `סולם ${ltr(mapper.easyKey)} (${ltr(`${signedShift > 0 ? '+' : ''}${signedShift}`)})`
    : 'הסולם כבר קל';
  // everything that changes what's shown, carried into performance mode
  const activeModes = [
    three && ltr(mapper.extra ? `1·4·5 + ${mapper.extra}` : '1·4·5'),
    easy && (easyBadge || 'קל לנגינה'),
    transpose !== 0 && `טרנספוזיציה ${transpose > 0 ? '+' : ''}${transpose}`,
  ].filter(Boolean) as string[];

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

  const isAuthor = true; // every song on this phone is yours

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

  const handlePrint = () => {
    const el = songContentRef.current?.querySelector('.song-content');
    if (el) {
      // A4 printable height ≈ 257mm (297mm - 2×1.5cm margin + header) ≈ 970px at 96dpi
      const fitsOnePage = el.scrollHeight <= 970;
      el.classList.toggle('print-two-cols', !fitsOnePage);
    }
    window.print();
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
        mapChord={mapper.map}
        modes={activeModes}
        onExit={() => setPerformanceMode(false)}
      />
    )}
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 print:song-wrap">
      <div className="flex items-start justify-between print:song-header">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold print:text-xl print:mb-0">{song.title}</h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-1 print:text-sm print:mt-0 print:text-black/60">{song.artist}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground print:hidden">
            {song.originalKey ? <span>סולם: {song.originalKey}</span> : null}
            {song.bpm ? <span>BPM: {song.bpm}</span> : null}
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
        <Button variant={three ? 'default' : 'secondary'} size="sm" aria-pressed={three} onClick={() => setThree(!three)}>
          <span dir="ltr">1·4·5</span>
        </Button>
        <Button variant={easy ? 'default' : 'secondary'} size="sm" aria-pressed={easy} onClick={() => setEasy(!easy)}>
          קל לנגינה
        </Button>
        {easyBadge && (
          <span className="rounded-md bg-chord/20 text-chord px-2 py-1 text-sm font-bold">{easyBadge}</span>
        )}
        <Button variant="secondary" size="sm" className="hidden sm:inline-flex" onClick={handlePrint}>הדפסה</Button>
        <Button variant="secondary" size="sm" onClick={() => setPerformanceMode(true)}>מצב הופעה</Button>

        <div className="relative" ref={settingsRef}>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSettingsOpen(!settingsOpen)}>
            <Settings className="h-4 w-4" />
          </Button>
          {settingsOpen && (
            <div className="fixed sm:absolute top-auto sm:top-full mt-1 inset-x-3 sm:inset-x-auto sm:end-0 z-40 rounded-lg bg-popover border border-border p-4 shadow-xl sm:w-56 space-y-4">
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
                <p className="text-xs font-medium text-muted-foreground">כלי נגינה</p>
                <div className="flex gap-1">
                  {INSTRUMENTS.map((inst) => (
                    <Button key={inst.value} size="sm"
                      variant={instrument === inst.value ? 'default' : 'secondary'}
                      onClick={() => setInstrument(inst.value)}
                      className="flex-1 text-xs">
                      {inst.label}
                    </Button>
                  ))}
                </div>
              </div>

              {'wakeLock' in navigator && (
                <div className="border-t border-border pt-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-medium text-muted-foreground">השאר מסך דלוק</span>
                    <input type="checkbox" checked={!!wakeLock} className="rounded"
                      onChange={async (e) => {
                        if (e.target.checked) {
                          try {
                            const lock = await navigator.wakeLock.request('screen');
                            setWakeLock(lock);
                          } catch { /* user denied or unsupported */ }
                        } else {
                          await wakeLock?.release().catch(() => {});
                          setWakeLock(null);
                        }
                      }}
                    />
                  </label>
                </div>
              )}

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

      <ChordStrip
        chords={three && mapper.three.length ? [...mapper.three, ...(mapper.extra ? [mapper.extra] : [])] : shownChords}
        title={!three ? 'האקורדים בשיר'
          : mapper.extra ? `${ltr(`I · IV · V + ${mapper.extra}`)} (השיר נשען עליו)` : ltr('I · IV · V')} />

      <div ref={songContentRef} className="rounded-lg bg-muted/30 p-4 sm:p-6">
        <SongRenderer content={song.content} mapChord={mapper.map} fontSize={fontSize} onChordHover={onChordHover} onChordLeave={onChordLeave} />
      </div>
      <ChordTooltipOverlay tooltip={tooltip} />
    </div>
    </>
  );
}
