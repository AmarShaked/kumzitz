type Tab4uResult = {
  title: string;
  artist: string;
  content: string;
};

/**
 * Extract the song path from a tab4u URL.
 */
export function extractPath(input: string): string {
  // accept a bare link, or text that contains one (e.g. from the phone's share sheet)
  const found = input.trim().match(/https?:\/\/[^\s]*tab4u\.com\/[^\s]*/i)?.[0] ?? input.trim();
  let url: URL;
  try {
    url = new URL(found);
  } catch {
    throw new Error('לא זוהה קישור תקין של tab4u');
  }
  if (!/(^|\.)tab4u\.com$/i.test(url.hostname) || !url.pathname.startsWith('/tabs/songs/')) {
    throw new Error('לא זוהה קישור תקין של tab4u');
  }
  let path = url.pathname;
  if (!path.endsWith('.html')) path += '.html';
  return path;
}

/** Canonical link for a song (used to recognise songs that were already added). */
export function canonicalTab4uUrl(input: string): string {
  return `https://www.tab4u.com${extractPath(input)}`;
}

function decodeHtmlEntities(text: string): string {
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}

/**
 * Parse the chords HTML row and return each chord with its text offset,
 * mirrored for RTL alignment.
 *
 * Tab4u's chords are Latin (LTR) text inside an RTL table cell.
 * In the HTML source, the first chord has a LOW offset but visually
 * appears on the RIGHT (because the RTL bidi algorithm reverses LTR runs).
 * Hebrew lyrics are natively RTL, so their source order = visual order.
 *
 * To align chords with lyrics, we mirror:
 *   mirrored_offset = totalTextLen - source_offset - chord_name_length
 */
function parseChordsWithPositions(html: string, mirror = true): { chord: string; offset: number }[] {
  const raw: { chord: string; offset: number; len: number }[] = [];
  let textPos = 0;
  let remaining = html;

  while (remaining.length > 0) {
    const wsMatch = remaining.match(/^[\s\n\r\t]+/);
    if (wsMatch) { remaining = remaining.slice(wsMatch[0].length); continue; }

    if (remaining.startsWith('&nbsp;')) { textPos++; remaining = remaining.slice(6); continue; }

    const spanMatch = remaining.match(/^<span[^>]*class="c_C"[^>]*>([^<]+)<\/span>/);
    if (spanMatch) {
      const chordName = spanMatch[1].trim();
      raw.push({ chord: chordName, offset: textPos, len: chordName.length });
      textPos += chordName.length;
      remaining = remaining.slice(spanMatch[0].length);
      continue;
    }

    const tagMatch = remaining.match(/^<[^>]+>/);
    if (tagMatch) { remaining = remaining.slice(tagMatch[0].length); continue; }

    textPos++;
    remaining = remaining.slice(1);
  }

  const totalLen = textPos;

  // Hebrew (RTL) songs: mirror offsets; English (LTR) songs: positions are already right
  return raw
    .map((c) => ({ chord: c.chord, offset: mirror ? totalLen - c.offset - c.len : c.offset }))
    .sort((a, b) => a.offset - b.offset);
}

function isMostlyHebrew(text: string): boolean {
  const hebrew = (text.match(/[\u0590-\u05FF]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  return hebrew > latin;
}

/**
 * Build a ChordPro line by inserting [chord] tags at the correct character
 * offsets within the lyrics string.
 */
function buildChordProLine(
  chords: { chord: string; offset: number }[],
  lyrics: string,
): string {
  // Chords-only line (no lyrics)
  if (!lyrics && chords.length > 0) {
    return chords.map((c) => `[${c.chord}]`).join(' ');
  }
  if (chords.length === 0) return lyrics;

  // Insert chord tags at their offsets within the lyrics
  let result = '';
  let chordIdx = 0;

  for (let i = 0; i <= lyrics.length; i++) {
    // Insert all chords whose offset matches this position
    while (chordIdx < chords.length && chords[chordIdx].offset <= i) {
      result += `[${chords[chordIdx].chord}]`;
      chordIdx++;
    }
    if (i < lyrics.length) {
      result += lyrics[i];
    }
  }

  // Append any remaining chords that extend past the lyrics length
  while (chordIdx < chords.length) {
    result += `[${chords[chordIdx].chord}]`;
    chordIdx++;
  }

  return result;
}

/**
 * Parse the raw HTML of a tab4u song page into ChordPro format.
 */
export function parseTab4uHtml(html: string): Tab4uResult {
  // Title and artist: the page <title> is "אקורדים לשיר {title} - {artist} | Tab4U";
  // fall back to the older <h1> layout.
  const titleTag = html.match(/<title>\s*אקורדים לשיר\s+(.+)\s+-\s+([^|<]+?)\s*(?:\||<\/title>)/);
  const h1Match = html.match(/<h1>.*?אקורדים לשיר\s+(.+?)\s+של\s+.*?>(.*?)<\/a>/);
  const pick = titleTag ?? h1Match;
  const title = pick ? decodeHtmlEntities(pick[1].replace(/<[^>]*>/g, '').trim()) : '';
  const artist = pick ? decodeHtmlEntities(pick[2].replace(/<[^>]*>/g, '').trim()) : '';

  // Extract the songContentTPL div
  const contentMatch = html.match(/<div id="songContentTPL"[^>]*>([\s\S]*?)(?:<\/div>\s*<\/div>\s*<\/div>|<div class="song_block_bottom")/);
  if (!contentMatch) throw new Error('לא נמצא תוכן השיר בעמוד');

  const songHtml = contentMatch[1];

  // Split into tables — each <br> separates sections/verses
  const tables = songHtml.split(/<br\s*\/?>/);

  const lines: string[] = [];

  for (const table of tables) {
    // Hebrew songs mark chord rows "chords"; English (left-to-right) songs use "chords_en"
    const rows = [...table.matchAll(/<tr>\s*<td class="(chords|chords_en|song)">([\s\S]*?)<\/td>\s*<\/tr>/g)];
    if (rows.length === 0) continue;

    let i = 0;
    while (i < rows.length) {
      const rowType = rows[i][1];
      const rowContent = rows[i][2];

      if (rowType === 'chords' || rowType === 'chords_en') {
        let chords = parseChordsWithPositions(rowContent, rowType === 'chords');

        // Check if next row is lyrics
        const nextRow = rows[i + 1];
        if (nextRow && nextRow[1] === 'song') {
          const lyricText = nextRow[2]
            .replace(/&nbsp;/g, ' ')
            .replace(/<[^>]*>/g, '')
            .trim();

          // A Hebrew line inside an English (left-to-right) song runs right-to-left from
          // the left edge, so visual column x sits over character (length - x - chordLength).
          if (rowType === 'chords_en' && isMostlyHebrew(lyricText)) {
            chords = chords
              .map((c) => ({ chord: c.chord, offset: Math.max(0, lyricText.length - c.offset - c.chord.length) }))
              .sort((a, b) => a.offset - b.offset);
          }

          lines.push(buildChordProLine(chords, lyricText));
          i += 2;
        } else {
          // Chords-only row
          lines.push(chords.map((c) => `[${c.chord}]`).join(' '));
          i++;
        }
      } else if (rowType === 'song') {
        const text = rowContent
          .replace(/&nbsp;/g, ' ')
          .replace(/<[^>]*>/g, '')
          .trim();
        if (text) lines.push(text);
        i++;
      } else {
        i++;
      }
    }

    lines.push('');
  }

  const content = lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return { title, artist, content };
}

/**
 * Fetch a tab4u song page and convert it to ChordPro.
 * The page is fetched through our own /api/tab4u route (Vite proxy in dev, a Vercel
 * rewrite in production) because browsers block reading other sites directly.
 * Used with tab4u's permission.
 */
export async function importFromTab4u(url: string): Promise<Tab4uResult> {
  const path = extractPath(url);
  const proxyUrl = `/api/tab4u${path}`;

  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`שגיאה בטעינת העמוד (${res.status})`);

  const html = await res.text();
  return parseTab4uHtml(html);
}
