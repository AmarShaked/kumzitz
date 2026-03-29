import SongRenderer from '../../components/SongRenderer';
import { useEditor } from './EditorProvider';

export default function EditorPreview() {
  const { state } = useEditor();

  return (
    <div className="h-full min-h-[400px] bg-gray-900 p-4 overflow-auto">
      {state.content ? (
        <SongRenderer content={state.content} />
      ) : (
        <p className="text-gray-600 text-sm">תצוגה מקדימה תופיע כאן...</p>
      )}
    </div>
  );
}
