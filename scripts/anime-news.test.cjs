const {test} = require('node:test');
const assert = require('node:assert/strict');
const {normalizeItems, safeArticleUrl, validateSummaries, createDigest, SOURCES} = require('./anime-news.cjs');

test('RSS accepts only trusted HTTPS links and recent dated anime stories', () => {
  const now = Date.now();
  const story = {title: 'New anime trailer', link: 'https://www.animenewsnetwork.com/news/example', isoDate: new Date(now).toISOString()};
  const items = normalizeItems({items: [story,
    {...story, link: 'https://www.animenewsnetwork.com.evil.example/news/a'},
    {...story, link: 'javascript:alert(1)'},
    {...story, isoDate: 'invalid'},
    {...story, isoDate: new Date(now + 2 * 3600000).toISOString()},
    {...story, isoDate: new Date(now - 15 * 86400000).toISOString()},
    {...story, title: 'WEBTOON launches new comics app'}]}, SOURCES[0], now);
  assert.equal(items.length, 1);
  assert.equal(safeArticleUrl('https://crunchyroll.com/news/a', SOURCES[1].host), 'https://crunchyroll.com/news/a');
  assert.equal(safeArticleUrl('http://crunchyroll.com/news/a', SOURCES[1].host), null);
});

test('AI output cannot replace source metadata or publish unknown stories', () => {
  const original = {id: 'trusted', url: 'https://www.animenewsnetwork.com/news/a', excerpt: 'New anime'};
  const result = validateSummaries({items: [{id: 'trusted', title: 'ข่าวอนิเมะ', summary: 'ประกาศอนิเมะใหม่', category: 'invented', url: 'https://evil.example', source: 'Fake'}]}, [original]);
  assert.equal(result[0].url, original.url);
  assert.equal(result[0].category, 'announcement');
  assert.equal(result[0].excerpt, undefined);
  assert.throws(() => validateSummaries({items: [{id: 'forged', title: 'ข่าว', summary: 'ข่าว'}]}, [original]));
  assert.throws(() => validateSummaries({items: [{id: 'trusted', title: 'English', summary: 'English'}]}, [original]));
});

test('unchanged articles reuse their summaries without calling AI', async () => {
  const now = Date.now(), publishedAt = new Date(now).toISOString();
  const original = normalizeItems({items: [{title: 'Anime announcement', link: 'https://www.animenewsnetwork.com/news/a', isoDate: publishedAt, contentSnippet: 'A new anime'}]}, SOURCES[0], now)[0];
  const saved = {...original, title: 'ประกาศอนิเมะ', summary: 'มีอนิเมะใหม่', aiSummarized: true}; delete saved.excerpt;
  const originalFetch = global.fetch; let calls = 0;
  global.fetch = async url => {
    assert(SOURCES.some(source => source.feed === url), 'must not call the AI endpoint'); calls++;
    return {ok: true, text: async () => `<rss version="2.0"><channel><title>News</title><item><title>Anime announcement</title><link>https://www.animenewsnetwork.com/news/a</link><pubDate>${new Date(now).toUTCString()}</pubDate><description>A new anime</description></item></channel></rss>`};
  };
  try {
    const digest = await createDigest('test-key', {items: [saved]});
    assert.equal(calls, 2); assert.equal(digest.items.length, 1); assert.equal(digest.items[0].summary, saved.summary);
  } finally {global.fetch = originalFetch;}
});
