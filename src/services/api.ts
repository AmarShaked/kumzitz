import { pb } from './pocketbase';
import type { Song } from '../types/song';

type SongCreate = {
  title: string;
  artist: string;
  content: string;
  originalKey: string;
  bpm: number | null;
  isPublic: boolean;
};

type SongUpdate = Partial<SongCreate>;

type SongFilters = {
  search?: string;
  artist?: string;
  page?: number;
  perPage?: number;
};

export type ArtistCount = {
  artist: string;
  count: number;
};

function escapeFilter(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
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
  const songs = await pb.collection('songs').getFullList<Pick<Song, 'artist'>>({
    filter: 'isPublic = true',
    fields: 'artist',
  });
  return aggregateTopArtists(songs, limit);
}

export async function getSongs(filters: SongFilters = {}) {
  const { search, artist, page = 1, perPage = 20 } = filters;
  const parts = ['isPublic = true'];
  if (search) {
    parts.push(`(title ~ "${escapeFilter(search)}" || artist ~ "${escapeFilter(search)}")`);
  }
  if (artist) {
    parts.push(`artist = "${escapeFilter(artist)}"`);
  }
  const filter = parts.join(' && ');

  return pb.collection('songs').getList<Song>(page, perPage, {
    filter,
    sort: '-created',
    expand: 'author',
  });
}

export async function getSong(id: string) {
  return pb.collection('songs').getOne<Song>(id, {
    expand: 'author',
  });
}

export async function createSong(data: SongCreate) {
  return pb.collection('songs').create<Song>({
    ...data,
    author: pb.authStore.record?.id,
  });
}

export async function updateSong(id: string, data: SongUpdate) {
  return pb.collection('songs').update<Song>(id, data);
}

export async function deleteSong(id: string) {
  return pb.collection('songs').delete(id);
}
