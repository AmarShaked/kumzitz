# Kumzitz — Design Specification

A community Hebrew chord platform for sharing, transposing, and performing guitar chord sheets.

## Tech Stack

- **Frontend:** Vite + React + TypeScript + Tailwind CSS
- **Routing:** React Router v7
- **Data fetching:** TanStack Query (React Query)
- **Backend:** PocketBase (hosted at pastacalc.fly.dev)
- **Auth:** PocketBase built-in auth, open registration
- **Chord diagrams:** svguitar (extensible to piano/ukulele later)

## Architecture

Feature-based module structure:

```
src/
  features/
    songs/         → list, search, view, CRUD, export
    editor/        → textarea + live preview, chord insertion
    transpose/     → key shifting logic
    chords/        → SVG tooltip diagrams via svguitar
    performance/   → fullscreen mode, auto-scroll
    auth/          → PocketBase auth (login, register, profile)
  services/
    pocketbase.ts  → PocketBase client singleton
    api.ts         → typed CRUD operations wrapping PB SDK
  components/      → shared UI components (RTL layout shell, buttons, inputs)
  lib/
    chordpro.ts    → ChordPro parser and serializer
    transpose.ts   → chromatic transposition utility
  types/           → shared TypeScript types
  App.tsx
  main.tsx
```

## Data Model

### PocketBase `songs` collection

| Field        | Type              | Notes                          |
|-------------|-------------------|--------------------------------|
| id          | auto              | PocketBase auto-generated      |
| title       | text, required    | Song title (Hebrew)            |
| artist      | text, required    | Artist name (Hebrew)           |
| content     | text, required    | ChordPro format string         |
| originalKey | text              | e.g. "G", "Am"                 |
| bpm         | number, optional  |                                |
| isPublic    | bool, default true|                                |
| author      | relation → users  | PocketBase user who created it |
| created     | auto              | PocketBase timestamp           |
| updated     | auto              | PocketBase timestamp           |

### PocketBase `users` collection

Uses PocketBase's built-in auth collection with default fields (email, username, etc.). Open registration, no email verification in v1.

## ChordPro Parser

### Parsing

Input: `"[G]שלום [D]עולם"`

Regex-based parser splits content into segments:

```typescript
type ChordSegment = {
  chord: string | null;  // "G", "D", or null for text-only
  text: string;          // "שלום ", "עולם"
};
```

Output: `[{ chord: "G", text: "שלום " }, { chord: "D", text: "עולם" }]`

Handles:
- Chords at start/middle/end of lines
- Lines with no chords (pure lyrics)
- Empty lines (section breaks)
- ChordPro directives: `{title:}`, `{artist:}`, `{key:}` (extracted to metadata)

### Serialization

Reverse operation — segments back to ChordPro string for `.chordpro` export.

## RTL Chord Rendering

Each parsed segment renders as a `<span>` with two vertically stacked layers:

```
   G          D
שלום       עולם
←── reading direction ───
```

- Container: `direction: rtl` — segments flow right-to-left
- Chord label: `direction: ltr; unicode-bidi: embed` — chord names read left-to-right
- Lyrics: inherit RTL from container

Each segment is an inline-block span with:
- `display: inline-block` to keep chord+text pairs together
- Chord positioned above text via flexbox column layout
- Whitespace preserved to maintain natural spacing

## Transpose Utility

Operates on parsed `ChordSegment[]` data. Shifts each chord by N semitones using chromatic scale lookup.

Chromatic scale: `C, C#, D, D#, E, F, F#, G, G#, A, A#, B`

Handles:
- Sharp notation (C# → D# when transposing +2)
- Flat notation (Bb → B when transposing +1), normalizes to sharp
- Suffixes preserved: `Am` → `Bm`, `G7` → `A7`, `Cmaj7` → `Dmaj7`
- Minor keys detected by `m` suffix

Does not touch lyrics — only modifies chord values in segments.

## Chord Tooltip Diagrams

Uses `svguitar` library to render SVG chord diagrams.

- Hover over any chord label → tooltip shows fingering diagram
- Chord data stored as a static map: chord name → svguitar configuration
- Initial coverage: major, minor, 7th, maj7, min7 for all root notes
- Component abstracts instrument type (`guitar` initially) — designed for future `piano` and `ukulele` support via swappable diagram renderers

## Editor

### Layout

Split-pane, horizontal (in RTL context, the primary editing pane is on the right):
- **Right (primary):** `<textarea>` for raw ChordPro input
- **Left (secondary):** live rendered preview (debounced on keystroke)

### Toolbar

- **Insert Chord** button → dropdown with common chords, inserts `[X]` at textarea cursor
- Key selector (sets `originalKey`)
- BPM input
- Title and artist fields
- Public/private toggle

### Metadata

Title, artist, key, BPM, and visibility sit in a collapsible header above the editor panes.

### Abstraction

Editor logic wrapped in an `EditorProvider` context. The textarea is a swappable implementation — can be replaced with a contentEditable rich editor in v2 without changing toolbar, preview, or data flow.

## Auth

PocketBase built-in auth with open registration.

### Pages

- `/login` — email + password form
- `/register` — email + username + password form
- `/profile` — view/edit display name

### Auth State

PocketBase SDK manages auth token in localStorage. TanStack Query wraps auth state so components can use `useAuth()` hook for:
- Current user object
- `isAuthenticated` boolean
- `login()`, `register()`, `logout()` mutations

### Permissions

- Anyone can view public songs (no auth required)
- Auth required to create songs
- Only the author can edit/delete their own songs
- PocketBase API rules enforce this server-side

## Performance Mode

Activated via button on song view page.

- Fullscreen via Fullscreen API
- Hides all UI chrome: nav, sidebar, metadata, edit buttons
- Shows only: song title, transposed chord+lyrics, transpose controls
- Font size adjustable with +/- buttons (persisted to localStorage)
- Auto-scroll: `requestAnimationFrame` loop, speed controlled by slider
- Exit: ESC key or floating exit button

## Print Engine

`@media print` stylesheet:

- Strips nav, buttons, tooltips, scroll controls
- Formats as clean song sheet: title, artist, key at top; chord+lyrics body
- Optimized for A4 paper with sensible margins
- Preserves RTL layout
- Chord labels printed inline above lyrics

## Export / Import

### Export

Two formats available via buttons on song view:
- **JSON:** Full song object as `.json` file download
- **ChordPro:** Content serialized to `.chordpro` file download

### Import

- **JSON:** Upload `.json` file → validates against schema → creates new song
- **ChordPro:** Upload `.chordpro` file → parses directives for metadata → creates new song

## Routing

| Route              | Page               | Auth Required |
|--------------------|--------------------|---------------|
| `/`                | Song list / search | No            |
| `/song/:id`        | Song view          | No (if public)|
| `/song/:id/edit`   | Song editor        | Yes (author)  |
| `/new`             | New song editor    | Yes           |
| `/login`           | Login form         | No            |
| `/register`        | Register form      | No            |
| `/profile`         | User profile       | Yes           |

## API Layer

`services/pocketbase.ts` — singleton PocketBase client:

```typescript
import PocketBase from 'pocketbase';
export const pb = new PocketBase('https://pastacalc.fly.dev');
```

`services/api.ts` — typed CRUD operations:

```typescript
// All functions are async, return typed data
getSongs(filters?) → Song[]
getSong(id) → Song
createSong(data) → Song
updateSong(id, data) → Song
deleteSong(id) → void
```

TanStack Query hooks in each feature module wrap these for caching, optimistic updates, and background refetching.

## RTL Global Setup

- `<html dir="rtl" lang="he">` on the document
- Tailwind configured with RTL support
- All layout uses logical properties (`ms-`, `me-`, `ps-`, `pe-` instead of `ml-`, `mr-`, `pl-`, `pr-`)
- Font: system Hebrew font stack, with a good Hebrew web font as primary (e.g., Heebo or Assistant from Google Fonts)

## Shareable Links

Songs are accessible at `/song/:id`. Since PocketBase provides real persistent IDs, these URLs work as shareable links from day one. The song view page:
- Fetches from PocketBase by ID
- If public: renders for anyone
- If private and not the author: shows "song not found" message
- If not found: 404 page

## Out of Scope for v1

- YouTube integration / chord extraction
- Piano and ukulele chord diagrams (architecture supports it, not implemented)
- Real-time collaborative editing
- Setlist management
- Email verification
- SSR / SEO optimization
- Social features (likes, comments, favorites)
