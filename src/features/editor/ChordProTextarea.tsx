import { useRef, useEffect } from 'react';
import { useEditor } from './EditorProvider';

export default function ChordProTextarea() {
  const { state, setContent, setCursorPosition, cursorPosition } = useEditor();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.selectionStart = cursorPosition;
      textareaRef.current.selectionEnd = cursorPosition;
      textareaRef.current.focus();
    }
  }, [cursorPosition]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  return (
    <textarea
      ref={textareaRef}
      value={state.content}
      onChange={handleChange}
      onSelect={handleSelect}
      dir="rtl"
      placeholder={"הקלד מילים עם אקורדים בפורמט ChordPro...\nדוגמה: [G]שלום [D]עולם"}
      className="w-full h-full min-h-[400px] bg-muted/30 p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none"
    />
  );
}
