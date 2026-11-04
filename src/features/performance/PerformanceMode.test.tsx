import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PerformanceMode from './PerformanceMode';
import { buildChordMapper } from '../../lib/simplify';

const CONTENT = '[Dm]שורה [Am]אחת\n[Gm]שורה [F]שתיים\n[Bb]עוד [C6]שורה';
const CHORDS = ['Dm', 'Am', 'Gm', 'F', 'Bb', 'C6'];

const shownChords = () =>
  [...new Set(screen.getAllByText(/^[A-G]/).map((e) => e.textContent?.trim()))].filter(Boolean);

describe('PerformanceMode', () => {
  it('shows the chords exactly as chosen on the song page (3 chords + easy)', () => {
    const m = buildChordMapper(CHORDS, { transpose: 0, three: true, easy: true, instrument: 'guitar' });
    render(<PerformanceMode title="שיר" content={CONTENT} mapChord={m.map} modes={['3 אקורדים', `קאפו ${m.capo}`]} onExit={vi.fn()} />);
    const chords = shownChords();
    expect(chords.length).toBeLessThanOrEqual(3);
    expect(chords.every((c) => ['Am', 'Dm', 'Em'].includes(c!))).toBe(true);
    expect(screen.getByText('3 אקורדים')).toBeInTheDocument();
    expect(screen.getByText('קאפו 5')).toBeInTheDocument();
  });

  it('without settings from the page, shows the song as written', () => {
    render(<PerformanceMode title="שיר" content={CONTENT} onExit={vi.fn()} />);
    expect(shownChords()).toEqual(expect.arrayContaining(['Bb', 'C6']));
  });
});
