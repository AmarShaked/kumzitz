import { useState } from 'react';
import { useSongList } from './hooks/useSongs';
import SongCard from './SongCard';

export default function SongListPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useSongList(search || undefined);

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <input type="search" placeholder="חפש שיר או אמן..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg bg-gray-800 px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      {isLoading && <p className="text-center text-gray-400">טוען...</p>}
      {error && <p className="text-center text-red-400">שגיאה בטעינת שירים</p>}
      <div className="grid gap-3">
        {data?.items.map((song) => <SongCard key={song.id} song={song} />)}
      </div>
      {data?.items.length === 0 && !isLoading && (
        <p className="text-center text-gray-500">לא נמצאו שירים</p>
      )}
    </div>
  );
}
