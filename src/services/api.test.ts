import { describe, it, expect, beforeEach } from 'vitest';
import {
  createSong, getSong, getSongs, updateSong, deleteSong, getTopArtists, findSongBySource,
} from './api';

const base = { content: '[Am]שורה', originalKey: 'Am', bpm: null, isPublic: false };

describe('local song store', () => {
  beforeEach(() => localStorage.clear());

  it('creates a song and reads it back', async () => {
    const s = await createSong({ ...base, title: 'שיר', artist: 'אמן' });
    expect(s.id).toBeTruthy();
    expect((await getSong(s.id)).title).toBe('שיר');
  });

  it('persists across reads (stored in localStorage)', async () => {
    await createSong({ ...base, title: 'א', artist: 'ב' });
    expect(localStorage.getItem('kumzitz-songs-v1')).toContain('"title":"א"');
  });

  it('lists newest first and filters by search and artist', async () => {
    await createSong({ ...base, title: 'ראשון', artist: 'דני' });
    await new Promise((r) => setTimeout(r, 5));
    await createSong({ ...base, title: 'שני', artist: 'רונית' });
    expect((await getSongs()).items.map((s) => s.title)).toEqual(['שני', 'ראשון']);
    expect((await getSongs({ search: 'רונ' })).items).toHaveLength(1);
    expect((await getSongs({ artist: 'דני' })).items[0].title).toBe('ראשון');
  });

  it('updates and deletes', async () => {
    const s = await createSong({ ...base, title: 'x', artist: 'y' });
    await updateSong(s.id, { title: 'z' });
    expect((await getSong(s.id)).title).toBe('z');
    await deleteSong(s.id);
    await expect(getSong(s.id)).rejects.toThrow();
  });

  it('counts artists', async () => {
    await createSong({ ...base, title: '1', artist: 'א' });
    await createSong({ ...base, title: '2', artist: 'א' });
    await createSong({ ...base, title: '3', artist: 'ב' });
    expect(await getTopArtists()).toEqual([{ artist: 'א', count: 2 }, { artist: 'ב', count: 1 }]);
  });

  it('finds an already-imported song by its source link', async () => {
    const s = await createSong({ ...base, title: 't', artist: 'a', source: 'https://www.tab4u.com/tabs/songs/1_x.html' });
    expect((await findSongBySource('https://www.tab4u.com/tabs/songs/1_x.html'))?.id).toBe(s.id);
    expect(await findSongBySource('https://www.tab4u.com/tabs/songs/2_y.html')).toBeNull();
  });

  it('survives corrupt storage', async () => {
    localStorage.setItem('kumzitz-songs-v1', '{not json');
    expect((await getSongs()).items).toEqual([]);
  });
});
