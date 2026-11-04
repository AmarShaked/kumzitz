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
  /** Where the song came from, e.g. its tab4u link (used to avoid duplicate imports). */
  source?: string;
  author: string;
  created: string;
  updated: string;
};
