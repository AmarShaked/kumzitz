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
  page?: number;
  perPage?: number;
};

export async function getSongs(filters: SongFilters = {}) {
  const { search, page = 1, perPage = 20 } = filters;
  const filter = search
    ? `(title ~ "${search}" || artist ~ "${search}") && isPublic = true`
    : 'isPublic = true';

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
