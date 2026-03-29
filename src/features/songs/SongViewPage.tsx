import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSong, useDeleteSong } from './hooks/useSongs';
import SongRenderer from '../../components/SongRenderer';
import { pb } from '../../services/pocketbase';

export default function SongViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: song, isLoading, error } = useSong(id!);
  const { mutateAsync: removeSong } = useDeleteSong();
  const [transpose, setTranspose] = useState(0);

  if (isLoading) return <p className="p-8 text-center text-gray-400">טוען...</p>;
  if (error || !song) return <p className="p-8 text-center text-red-400">השיר לא נמצא</p>;

  const isAuthor = pb.authStore.record?.id === song.author;

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
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{song.title}</h1>
          <p className="text-lg text-gray-400 mt-1">{song.artist}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            {song.originalKey && <span>סולם: {song.originalKey}</span>}
            {song.bpm && <span>BPM: {song.bpm}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          {isAuthor && (
            <>
              <Link to={`/song/${song.id}/edit`} className="rounded-lg bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600">עריכה</Link>
              <button onClick={handleDelete} className="rounded-lg bg-red-800 px-3 py-2 text-sm hover:bg-red-700">מחיקה</button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <button onClick={() => setTranspose(t => t - 1)} className="rounded bg-gray-700 w-8 h-8 flex items-center justify-center hover:bg-gray-600 text-lg font-bold">-</button>
          <span className="text-sm text-gray-300 min-w-[40px] text-center">{transpose !== 0 ? (transpose > 0 ? `+${transpose}` : transpose) : '0'}</span>
          <button onClick={() => setTranspose(t => t + 1)} className="rounded bg-gray-700 w-8 h-8 flex items-center justify-center hover:bg-gray-600 text-lg font-bold">+</button>
          {transpose !== 0 && <button onClick={() => setTranspose(0)} className="text-xs text-gray-500 hover:text-gray-300">איפוס</button>}
        </div>
        <button onClick={handleExportJson} className="rounded bg-gray-700 px-3 py-1 text-sm hover:bg-gray-600">ייצוא JSON</button>
        <button onClick={handleExportChordPro} className="rounded bg-gray-700 px-3 py-1 text-sm hover:bg-gray-600">ייצוא ChordPro</button>
        <button onClick={() => window.print()} className="rounded bg-gray-700 px-3 py-1 text-sm hover:bg-gray-600">הדפסה</button>
      </div>

      <div className="rounded-lg bg-gray-900 p-6">
        <SongRenderer content={song.content} transpose={transpose} />
      </div>
    </div>
  );
}
