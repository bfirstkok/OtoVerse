export const WATCH_LABELS = { watching: 'กำลังดู', completed: 'ดูแล้ว', planned: 'อยากดู' };
export function animeSeriesKey(anime) {
 return String(anime?.animeTitle || anime?.title || anime || '').replace(/\s*\((?:OP|ED)\s*\d*\)\s*$/i,'').trim().toLowerCase().replace(/\s+/g,' ');
}
