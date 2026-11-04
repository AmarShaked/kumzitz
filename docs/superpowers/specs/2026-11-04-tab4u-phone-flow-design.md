# Tab4u → phone: chords and lyrics, simplified

**Goal:** you paste a tab4u link on your phone, and the song (chords above the lyrics) is
saved on that phone. It can be shown as-is, cut down to **3 chords (the song's I, IV, V)**,
or in **easy shapes**:
- **guitar:** a capo plus open-chord shapes, so the song keeps its original key;
- **piano/ukulele:** moved to the easiest key.

The shapes are always visible, and the app installs on the phone and works offline.

## Decisions
- **Tab4u content is used with Tab4u's permission.**
  - The app fetches pages through its own `/api/tab4u/*` route: Vite's proxy in dev, and a
    Vercel rewrite in `vercel.json` in production. Browsers can't read tab4u.com directly
    (CORS).
  - Imported songs are stored on the phone only and are never shared.
- **No backend:**
  - Songs live in `localStorage` (`kumzitz-songs-v1`), per device. `services/api.ts` keeps
    the same function signatures, so the React Query hooks and screens are unchanged.
  - PocketBase, login, register and profile were removed. Every song on a phone belongs to
    its owner.
  - JSON and ChordPro export and import still work, for moving songs between phones.
- **Adding songs:**
  - The home screen has a paste box (`AddFromTab4u`).
  - `/add?url=|text=` is the PWA **share target**. On Android, sharing from the browser to
    Kumzitz imports the song straight away.
  - Duplicate imports open the existing song, matched by its canonical tab4u link
    (`song.source`).
- **Simplifying** (`lib/simplify.ts`, `buildChordMapper`). Each written chord goes through
  these steps in order:
  1. manual transpose;
  2. 3-chords mode, the 1-4-5 system: each chord is folded onto the I, IV or V with the
     same job:
     - **home:** major I, iii, vi, bIII; minor i, III;
     - **lead-in:** major ii, IV, bVI, bVII, bII; minor ii°, iv, VI, bII;
     - **tension:** major V, vii°; minor v/V, VII, vii°.

     IV and V keep the song's own quality when the song uses that chord (for example a
     minor v), otherwise the textbook one (minor key: iv minor, V major). Chords outside
     those lists go to the nearest of the three by shared notes. With no key, the song's 3
     most-used chords are used;
  3. easy mode:
     - guitar: the capo fret 0–7 that minimises shape difficulty (open = 0, F/Bm = 2,
       other barres = 3, plus 0.15 per fret; B is shown as B7);
     - other instruments: the existing `findEasiestTranspose`.
- **Key detection** combines how many chords are diatonic (including harmonic-minor V and
  the major IV in minor), how much the tonic chord is used, and the first and last chord.
  The last chord is weighted lightly, because many songs end on a half cadence. The key is
  stored as `originalKey` when a song is imported.
- **Chord strip:** the chords to play, in order of first appearance (in 3-chords mode, I · IV ·
  V in that order), with guitar/ukulele/piano diagrams. Chords with no diagram show their basic triad
  ("C6 ≈ C").
- **PWA:**
  - `public/manifest.webmanifest` (RTL, Hebrew, share target) and icons;
  - `public/sw.js`: network-first for pages, cache-first for built files, and `/api/*` is
    never cached. It is registered in production only.

## Not done / follow-ups
- The Vercel rewrite to tab4u has not been verified on a live deployment.
- iPhone has no PWA share target, so iPhone users paste the link.
- `npm run lint` fails because ESLint isn't installed in the project (this predates this
  change).
