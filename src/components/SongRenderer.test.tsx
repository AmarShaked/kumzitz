import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import SongRenderer from './SongRenderer';

describe('SongRenderer direction', () => {
  it('lays out Hebrew songs right-to-left', () => {
    const { container } = render(<SongRenderer content={'[Am]שלום [F]לכם'} />);
    expect(container.querySelector('.song-content')).toHaveAttribute('dir', 'rtl');
  });
  it('lays out English songs left-to-right', () => {
    const { container } = render(<SongRenderer content={'[G]Hello [D]my friend\n[C]la la'} />);
    expect(container.querySelector('.song-content')).toHaveAttribute('dir', 'ltr');
  });
  it('gives each line its own direction in mixed songs', () => {
    const { container } = render(<SongRenderer content={'[G]Hello [D]friend\n[Am]שלום [F]לכם'} />);
    const lines = container.querySelectorAll('.song-content > div');
    expect(lines[0]).toHaveAttribute('dir', 'ltr');
    expect(lines[1]).toHaveAttribute('dir', 'rtl');
  });
});
