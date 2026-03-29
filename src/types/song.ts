export type ChordSegment = {
  chord: string | null;
  text: string;
};

export type SongLine = {
  segments: ChordSegment[];
};

export type ChordProDirectives = {
  title?: string;
  artist?: string;
  key?: string;
};

export type Song = {
  id: string;
  title: string;
  artist: string;
  content: string;
  originalKey: string;
  bpm: number | null;
  isPublic: boolean;
  author: string;
  created: string;
  updated: string;
};
