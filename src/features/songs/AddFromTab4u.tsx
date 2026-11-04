import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { canonicalTab4uUrl, importFromTab4u } from '@/services/tab4u';
import { findSongBySource } from '@/services/api';
import { detectKey } from '@/lib/simplify';
import { useCreateSong, useUpdateSong } from './hooks/useSongs';

type Props = {
  /** Pre-filled link or shared text (from the phone's share sheet). */
  initial?: string;
  /** Start importing right away (used when a link was shared to the app). */
  autoStart?: boolean;
};

/** Paste a tab4u link → the song is saved on this phone and opens. */
export default function AddFromTab4u({ initial = '', autoStart = false }: Props) {
  const [url, setUrl] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { mutateAsync: create } = useCreateSong();
  const { mutateAsync: update } = useUpdateSong();
  const started = useRef(false);

  const add = async (value: string) => {
    if (!value.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const source = canonicalTab4uUrl(value);
      const existing = await findSongBySource(source);
      // already on the phone with chords: just open it (an older import may have no chords)
      if (existing && /\[[^\]]+\]/.test(existing.content)) {
        navigate(`/song/${existing.id}`);
        return;
      }
      const result = await importFromTab4u(source);
      const chords = [...result.content.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
      if (existing) {
        await update({ id: existing.id, data: {
          title: result.title || existing.title,
          artist: result.artist || existing.artist,
          content: result.content,
          originalKey: detectKey(chords)?.name ?? '',
        } });
        navigate(`/song/${existing.id}`);
        return;
      }
      const song = await create({
        title: result.title || 'ללא שם',
        artist: result.artist || 'לא ידוע',
        content: result.content,
        originalKey: detectKey(chords)?.name ?? '',
        bpm: null,
        isPublic: false,
        source,
      });
      navigate(`/song/${song.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'לא הצלחנו להביא את השיר');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (autoStart && initial && !started.current) {
      started.current = true;
      add(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, initial]);

  return (
    <form
      className="rounded-lg border border-border bg-card p-3 sm:p-4 space-y-2"
      onSubmit={(e) => { e.preventDefault(); add(url); }}
    >
      <label htmlFor="tab4u-url" className="text-sm font-medium">הוספת שיר מ-tab4u</label>
      <div className="flex gap-2">
        <Input
          id="tab4u-url"
          type="url"
          dir="ltr"
          inputMode="url"
          placeholder="https://www.tab4u.com/tabs/songs/..."
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(''); }}
          className="flex-1 h-11 text-sm"
        />
        <Button type="submit" disabled={busy || !url.trim()} className="h-11 shrink-0">
          {busy ? 'מביא...' : 'הוסף'}
        </Button>
      </div>
      {error ? (
        <p className="text-destructive text-sm" role="alert">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">השיר נשמר בטלפון הזה ונפתח מיד, גם בלי אינטרנט בפעם הבאה.</p>
      )}
    </form>
  );
}
