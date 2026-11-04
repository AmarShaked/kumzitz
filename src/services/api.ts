// Songs live only on this device (browser localStorage). No server, no accounts.
import type { Song } from '../types/song';

const STORE_KEY = 'kumzitz-songs-v1';

type SongCreate = {
  title: string;
  artist: string;
  content: string;
  originalKey: string;
  bpm: number | null;
  isPublic: boolean;
  source?: string;
};

type SongUpdate = Partial<SongCreate>;

type SongFilters = {
  search?: string;
  artist?: string;
};

export type ArtistCount = {
  artist: string;
  count: number;
};

function readAll(): Song[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(songs: Song[]): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(songs));
  } catch {
    throw new Error('לא ניתן לשמור בטלפון (האחסון מלא או חסום)');
  }
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function aggregateTopArtists(songs: Pick<Song, 'artist'>[], limit = 15): ArtistCount[] {
  const counts = new Map<string, number>();
  for (const song of songs) {
    const name = song.artist?.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([artist, count]) => ({ artist, count }))
    .sort((a, b) => b.count - a.count || a.artist.localeCompare(b.artist, 'he'))
    .slice(0, limit);
}

export async function getTopArtists(limit = 15): Promise<ArtistCount[]> {
  return aggregateTopArtists(readAll(), limit);
}

export async function getSongs(filters: SongFilters = {}) {
  const { search, artist } = filters;
  const q = search?.trim().toLowerCase();
  const items = readAll()
    .filter((s) => !artist || s.artist === artist)
    .filter((s) => !q || s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
    .sort((a, b) => b.created.localeCompare(a.created));
  return { items, totalItems: items.length };
}

export async function getSong(id: string): Promise<Song> {
  const song = readAll().find((s) => s.id === id);
  if (!song) throw new Error('השיר לא נמצא');
  return song;
}

export async function findSongBySource(source: string): Promise<Song | null> {
  return readAll().find((s) => s.source === source) ?? null;
}

export async function createSong(data: SongCreate): Promise<Song> {
  const now = new Date().toISOString();
  const song: Song = { ...data, id: newId(), author: 'local', created: now, updated: now };
  writeAll([song, ...readAll()]);
  return song;
}

export async function updateSong(id: string, data: SongUpdate): Promise<Song> {
  const songs = readAll();
  const i = songs.findIndex((s) => s.id === id);
  if (i < 0) throw new Error('השיר לא נמצא');
  songs[i] = { ...songs[i], ...data, updated: new Date().toISOString() };
  writeAll(songs);
  return songs[i];
}

export async function deleteSong(id: string): Promise<void> {
  writeAll(readAll().filter((s) => s.id !== id));
}
