import { useParams, useNavigate } from 'react-router-dom';
import EditorProvider, { useEditor } from './EditorProvider';
import EditorToolbar from './EditorToolbar';
import ChordProTextarea from './ChordProTextarea';
import EditorPreview from './EditorPreview';
import { useSong, useCreateSong, useUpdateSong } from '../songs/hooks/useSongs';
import { Button } from '@/components/ui/button';

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
        <Button variant="success" onClick={handleSave} disabled={isSaving || !state.title || !state.artist || !state.content}>
          {isSaving ? 'שומר...' : 'שמור'}
        </Button>
      </div>
      <EditorToolbar />
      <div className="grid grid-cols-2 gap-4 rounded-lg border border-border overflow-hidden">
      <ChordProTextarea />

        <EditorPreview />
      </div>
    </div>
  );
}

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const { data: song, isLoading } = useSong(id ?? '');

  if (id && isLoading) return <p className="p-8 text-center text-muted-foreground">טוען...</p>;

  const initialState = song
    ? { title: song.title, artist: song.artist, content: song.content, originalKey: song.originalKey, bpm: song.bpm?.toString() ?? '', isPublic: song.isPublic }
    : undefined;

  return (
    <EditorProvider initialState={initialState} key={id}>
      <EditorContent songId={id} />
    </EditorProvider>
  );
}
