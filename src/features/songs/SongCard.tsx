import { Link } from 'react-router-dom';
import type { Song } from '../../types/song';

type SongCardProps = { song: Song };

export default function SongCard({ song }: SongCardProps) {
  return (
    <Link to={`/song/${song.id}`}
      className="block rounded-lg bg-card p-4 hover:bg-accent/20 transition-colors border border-border hover:border-ring">
      <h3 className="text-lg font-bold text-card-foreground">{song.title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{song.artist}</p>
      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
        {song.originalKey && <span>סולם: {song.originalKey}</span>}
        {song.bpm ? <span>BPM: {song.bpm}</span> : null}
      </div>
    </Link>
  );
}
