import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { importFromTab4u } from '@/services/tab4u';
import { useEditor } from './EditorProvider';

export default function Tab4uImport() {
  const { setTitle, setArtist, setContent } = useEditor();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!url.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await importFromTab4u(url);
      setTitle(result.title);
      setArtist(result.artist);
      setContent(result.content);
      setUrl('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'שגיאה בייבוא');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="url"
        dir="ltr"
        placeholder="הדבק קישור tab4u..."
        value={url}
        onChange={(e) => { setUrl(e.target.value); setError(''); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleImport(); } }}
        className="w-64 text-sm"
      />
      <Button size="sm" variant="secondary" onClick={handleImport} disabled={isLoading || !url.trim()}>
        {isLoading ? 'מייבא...' : 'ייבוא מ-tab4u'}
      </Button>
      {error && <span className="text-destructive text-xs">{error}</span>}
    </div>
  );
}
