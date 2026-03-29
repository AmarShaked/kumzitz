import { Link } from 'react-router-dom';
import type { Song } from '../../types/song';

type SongCardProps = { song: Song };

export default function SongCard({ song }: SongCardProps) {
  return (
    <Link to={`/song/${song.id}`}
      className="block rounded-lg bg-gray-800 p-4 hover:bg-gray-750 transition-colors border border-gray-700 hover:border-gray-600">
      <h3 className="text-lg font-bold text-gray-100">{song.title}</h3>
      <p className="text-sm text-gray-400 mt-1">{song.artist}</p>
      <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
        {song.originalKey && <span>סולם: {song.originalKey}</span>}
        {song.bpm && <span>BPM: {song.bpm}</span>}
      </div>
    </Link>
  );
}
