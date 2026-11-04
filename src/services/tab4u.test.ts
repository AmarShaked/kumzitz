import { describe, it, expect } from 'vitest';
import { extractPath, canonicalTab4uUrl, parseTab4uHtml } from './tab4u';

describe('extractPath', () => {
  it('accepts a normal song link', () => {
    expect(extractPath('https://www.tab4u.com/tabs/songs/123_abc.html')).toBe('/tabs/songs/123_abc.html');
  });
  it('drops query and hash (e.g. ?ton=1#song)', () => {
    expect(extractPath('https://www.tab4u.com/tabs/songs/123_abc.html?ton=1#song')).toBe('/tabs/songs/123_abc.html');
  });
  it('finds the link inside shared text', () => {
    expect(extractPath('תראו את השיר הזה https://www.tab4u.com/tabs/songs/9_x.html מעולה')).toBe('/tabs/songs/9_x.html');
  });
  it('accepts other tab4u subdomains', () => {
    expect(extractPath('https://m.tab4u.com/tabs/songs/9_x.html')).toBe('/tabs/songs/9_x.html');
  });
  it('rejects other sites and non-song pages', () => {
    expect(() => extractPath('https://example.com/tabs/songs/1.html')).toThrow();
    expect(() => extractPath('https://www.tab4u.com/tabs/artists/1_x.html')).toThrow();
    expect(() => extractPath('not a link')).toThrow();
  });
  it('builds one canonical link per song', () => {
    expect(canonicalTab4uUrl('https://m.tab4u.com/tabs/songs/9_x.html?ton=2')).toBe('https://www.tab4u.com/tabs/songs/9_x.html');
  });
});

// Synthetic page with tab4u's structure (invented words, not a real song).
const PAGE = `<h1>אקורדים לשיר שיר בדיקה של <a href="/x">להקת בדיקה</a></h1>
<div id="songContentTPL"><table><tr><td class="chords">&nbsp;&nbsp;<span class="c_C">Am</span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="c_C">F</span></td></tr>
<tr><td class="song">שלום&nbsp;לכם&nbsp;חברים</td></tr></table><br>
<table><tr><td class="chords"><span class="c_C">C</span>&nbsp;<span class="c_C">G</span></td></tr></table>
</div></div></div>`;

describe('parseTab4uHtml', () => {
  it('reads title, artist and ChordPro lines with chords over the lyrics', () => {
    const r = parseTab4uHtml(PAGE);
    expect(r.title).toBe('שיר בדיקה');
    expect(r.artist).toBe('להקת בדיקה');
    const lines = r.content.split('\n');
    expect(lines[0]).toContain('[Am]');
    expect(lines[0]).toContain('[F]');
    expect(lines[0].replace(/\[[^\]]+\]/g, '')).toBe('שלום לכם חברים');
    const chordsOnly = lines.find((l) => l.startsWith('[') && !l.replace(/\[[^\]]+\]|\s/g, ''));
    expect(chordsOnly).toMatch(/\[C\]/); // chords-only line keeps both chords
    expect(chordsOnly).toMatch(/\[G\]/);
  });
});

describe('parseTab4uHtml title', () => {
  it('reads title and artist from the page <title> (current tab4u layout)', () => {
    const page = `<title>אקורדים לשיר שיר - עם מקף - זמר בדיקה | Tab4U</title>
<h1><font class="blackNone">אקורדים לשיר שיר - עם מקף של <a class='artistTitle'>זמר בדיקה</a></font></h1>
<div id="songContentTPL"><table><tr><td class="song">מילים</td></tr></table></div></div></div>`;
    const r = parseTab4uHtml(page);
    expect(r.title).toBe('שיר - עם מקף');
    expect(r.artist).toBe('זמר בדיקה');
  });
});

// English (left-to-right) songs use <td class="chords_en"> and must not be mirrored.
const PAGE_EN = `<title>אקורדים לשיר Test Song - Test Band | Tab4U</title>
<div class="song_block ltrS"><div id="songContentTPL"><table><tr><td class="chords_en"><span class="c_C">G</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="c_C">D</span></td></tr>
<tr><td class="song">Hello my friend</td></tr></table>
</div></div></div>`;

describe('parseTab4uHtml (English songs)', () => {
  it('keeps the chords of left-to-right songs, over the right words', () => {
    const r = parseTab4uHtml(PAGE_EN);
    expect(r.title).toBe('Test Song');
    expect(r.artist).toBe('Test Band');
    expect(r.content.split('\n')[0]).toBe('[G]Hello [D]my friend');
  });
});

// A Hebrew line inside an English song: the Hebrew runs right-to-left in a left-aligned
// cell, so the visual chord column x sits over character (length - x - chordLength).
const PAGE_MIXED = `<title>אקורדים לשיר Mixed - Band | Tab4U</title>
<div class="song_block ltrS"><div id="songContentTPL"><table><tr><td class="chords_en"><span class="c_C">G</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="c_C">D</span></td></tr>
<tr><td class="song">אבגדה וזחט</td></tr></table>
</div></div></div>`;

describe('parseTab4uHtml (Hebrew line in an English song)', () => {
  it('mirrors chord positions against the Hebrew lyric', () => {
    expect(parseTab4uHtml(PAGE_MIXED).content.split('\n')[0]).toBe('אבג[D]דה וזח[G]ט');
  });
});
