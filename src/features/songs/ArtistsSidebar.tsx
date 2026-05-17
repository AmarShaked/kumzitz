import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArtistCount } from '../../services/api';

type ArtistsSidebarProps = {
  artists: ArtistCount[];
  selected: string | null;
  onSelect: (artist: string | null) => void;
  isLoading?: boolean;
  className?: string;
};

function ArtistButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-right transition-colors cursor-pointer',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground hover:bg-accent/50',
      )}
    >
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            'shrink-0 text-xs tabular-nums',
            active ? 'text-primary-foreground/80' : 'text-muted-foreground',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default function ArtistsSidebar({
  artists,
  selected,
  onSelect,
  isLoading,
  className,
}: ArtistsSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (artist: string | null) => {
    onSelect(artist);
    setIsOpen(false);
  };

  const nav = isLoading ? (
    <p className="text-sm text-muted-foreground px-1">טוען...</p>
  ) : (
    <nav>
      <ul className="space-y-0.5">
        <li>
          <ArtistButton
            label="כל האמנים"
            active={!selected}
            onClick={() => handleSelect(null)}
          />
        </li>
        {artists.map(({ artist, count }) => (
          <li key={artist}>
            <ArtistButton
              label={artist}
              count={count}
              active={selected === artist}
              onClick={() => handleSelect(selected === artist ? null : artist)}
            />
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <aside className={cn(className)}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="md:hidden w-full flex items-center justify-between gap-2 cursor-pointer"
      >
        <span className="text-sm font-semibold text-muted-foreground truncate">
          אמנים מובילים
          {selected && (
            <span className="text-foreground font-medium"> · {selected}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      <h2 className="hidden md:block text-sm font-semibold text-muted-foreground px-1 mb-3">
        אמנים מובילים
      </h2>

      <div className={cn('space-y-3', !isOpen && 'hidden md:block')}>{nav}</div>
    </aside>
  );
}
