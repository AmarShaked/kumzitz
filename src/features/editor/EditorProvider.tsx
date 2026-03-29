import { createContext, useContext, useState, useCallback } from 'react';

type EditorState = {
  title: string;
  artist: string;
  content: string;
  originalKey: string;
  bpm: string;
  isPublic: boolean;
};

type EditorContextType = {
  state: EditorState;
  setTitle: (v: string) => void;
  setArtist: (v: string) => void;
  setContent: (v: string) => void;
  setOriginalKey: (v: string) => void;
  setBpm: (v: string) => void;
  setIsPublic: (v: boolean) => void;
  insertChordAtCursor: (chord: string) => void;
  cursorPosition: number;
  setCursorPosition: (pos: number) => void;
};

const EditorContext = createContext<EditorContextType | null>(null);

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditor must be inside EditorProvider');
  return ctx;
}

type EditorProviderProps = {
  children: React.ReactNode;
  initialState?: Partial<EditorState>;
};

export default function EditorProvider({ children, initialState }: EditorProviderProps) {
  const [title, setTitle] = useState(initialState?.title ?? '');
  const [artist, setArtist] = useState(initialState?.artist ?? '');
  const [content, setContent] = useState(initialState?.content ?? '');
  const [originalKey, setOriginalKey] = useState(initialState?.originalKey ?? '');
  const [bpm, setBpm] = useState(initialState?.bpm?.toString() ?? '');
  const [isPublic, setIsPublic] = useState(initialState?.isPublic ?? true);
  const [cursorPosition, setCursorPosition] = useState(0);

  const insertChordAtCursor = useCallback(
    (chord: string) => {
      const tag = `[${chord}]`;
      const before = content.slice(0, cursorPosition);
      const after = content.slice(cursorPosition);
      setContent(before + tag + after);
      setCursorPosition(cursorPosition + tag.length);
    },
    [content, cursorPosition],
  );

  return (
    <EditorContext.Provider
      value={{ state: { title, artist, content, originalKey, bpm, isPublic }, setTitle, setArtist, setContent, setOriginalKey, setBpm, setIsPublic, insertChordAtCursor, cursorPosition, setCursorPosition }}>
      {children}
    </EditorContext.Provider>
  );
}
