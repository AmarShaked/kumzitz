import { useParams, useNavigate } from 'react-router-dom';
import EditorProvider, { useEditor } from './EditorProvider';
import EditorToolbar from './EditorToolbar';
import ChordProTextarea from './ChordProTextarea';
import EditorPreview from './EditorPreview';
import { useSong, useCreateSong, useUpdateSong } from '../songs/hooks/useSongs';

function EditorContent({ songId }: { songId?: string }) {
  const navigate = useNavigate();
  const { state } = useEditor();
  const { mutateAsync: create, isPending: isCreating } = useCreateSong();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateSong();

  const isSaving = isCreating || isUpdating;

  const handleSave = async () => {
    const data = {
      title: state.title,
      artist: state.artist,
      content: state.content,
      originalKey: state.originalKey,
      bpm: state.bpm ? Number(state.bpm) : null,
      isPublic: state.isPublic,
    };

    if (songId) {
      await update({ id: songId, data });
      navigate(`/song/${songId}`);
    } else {
      const created = await create(data);
      navigate(`/song/${created.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{songId ? 'עריכת שיר' : 'שיר חדש'}</h1>
        <button onClick={handleSave} disabled={isSaving || !state.title || !state.artist || !state.content}
          className="rounded-lg bg-green-600 px-6 py-2 font-medium hover:bg-green-700 disabled:opacity-50">
          {isSaving ? 'שומר...' : 'שמור'}
        </button>
      </div>
      <EditorToolbar />
      <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-700 overflow-hidden">
        <EditorPreview />
        <ChordProTextarea />
      </div>
    </div>
  );
}

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const { data: song, isLoading } = useSong(id ?? '');

  if (id && isLoading) return <p className="p-8 text-center text-gray-400">טוען...</p>;

  const initialState = song
    ? { title: song.title, artist: song.artist, content: song.content, originalKey: song.originalKey, bpm: song.bpm?.toString() ?? '', isPublic: song.isPublic }
    : undefined;

  return (
    <EditorProvider initialState={initialState} key={id}>
      <EditorContent songId={id} />
    </EditorProvider>
  );
}
