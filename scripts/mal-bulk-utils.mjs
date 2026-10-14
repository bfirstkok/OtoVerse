import aliases from '../src/lib/animeSearchAliases.js';
export const key = value => String(value || '').normalize('NFKC').toLowerCase().replace(/\s*\((?:op|ed)\s*\d*\)\s*$/i,'').replace(/[^\p{L}\p{N}\p{M}]/gu,'');
const titleKeys = value => {
 const title=String(value).replace(/\([^)]*\)/g,'').replace(/\b(\d+)(?:st|nd|rd|th)\s+season\b/gi,'Season $1').replace(/\bstaffel\b/gi,'Season').replace(/\bthe\s+final\b/gi,'Final').replace(/\bseason\s*1\b/gi,'').replace(/kyoushitsu e(?=\s|$)/gi,'kyoushitsu');
 return [key(value),key(title)];
};
function season(value){const title=String(value).replace(/\s*\((?:op|ed)\s*\d*\)\s*$/i,'');const number=title.match(/(?:season|staffel|ภาค)\s*(\d+)|(\d+)(?:st|nd|rd|th)\s+season|(?<!part)\s(\d+)\s*$/i)?.slice(1).find(Boolean)||'1';const part=title.match(/\bpart\s*(\d+)/i)?.[1]||'';return [number,part,/\bfinal\b/i.test(title),/\bmovie\b|\bseason\s*0\b/i.test(title)].join(':');}
function legacyNames(row){const title=row.animeTitle||String(row.title).replace(/\s*\((?:op|ed)\s*\d*\)\s*$/i,'');return [title,...(row.altTitles||[]),...(aliases[key(title)]||[]).filter(alias=>key(alias).length>=8 && season(alias)===season(title))];}
export function isDuplicate(anime, existing) {
 const names = [anime.title, anime.title_english, anime.title_japanese, ...(anime.title_synonyms || [])].filter(Boolean).flatMap(titleKeys);
 return existing.some(row => Number(row.malId) === Number(anime.mal_id) || (!row.malId && (!row.year || !anime.year || Number(row.year) === Number(anime.year)) && legacyNames(row).filter(name=>name && season(name)===season(anime.title)).flatMap(titleKeys).some(name => names.includes(name))));
}
export function parseThemes($) {
 const songs=[];
 for(const [selector,songType] of [['.theme-songs.opnening','OP'],['.theme-songs.ending','ED']]) {
  $(selector).find('tr').each((_,el)=>{ const cell=$(el).children('td').eq(1); const text=cell.text().trim();
   const match=text.match(/^(?:(\d+):\s*)?["“](.+?)["”]\s*by\s+(.+?)(?:\s*\(eps?\b|$)/i);
   if(!match)return;
   songs.push({songType,songNumber:Number(match[1])||1,songTitle:match[2].trim(),artist:match[3].trim(),sourceVideo:cell.find('input[id^="youtube_url"]').val() || ''});
  });
 }
 return [...new Map(songs.map(song=>[song.songType+song.songNumber,song])).values()];
}
export function videoCandidates(data,song) {
 const videos=[];const titles=[song.songTitle,song.songTitle.replace(/\([^)]*\)/g,''),...[...song.songTitle.matchAll(/\(([^)]+)\)/g)].map(x=>x[1])].map(key).filter(x=>x.length>=2);
 const artist=key(song.artist.replace(/\([^)]*\)/g,''));
 function walk(value){if(!value || typeof value!=='object')return;
  if(value.videoRenderer){const v=value.videoRenderer;const title=v.title?.runs?.map(x=>x.text).join('')||v.title?.simpleText||'';const owner=v.ownerText?.runs?.map(x=>x.text).join('')||'';
   const verified=(v.ownerBadges||[]).some(x=>/VERIFIED/.test(x.metadataBadgeRenderer?.style||''));
   if(verified && titles.some(x=>key(title).includes(x)) && artist.length>=3 && (key(owner).includes(artist)||key(title).includes(artist)) && !/cover|remix|karaoke|music\s*box|instrumental|piano|orchestral|arrangement|オルゴール|live\s|english ver|歌ってみた|弾いてみた|sped up|slowed/i.test(title)) videos.push({id:v.videoId,title,channel:owner});
   return;
  }
  for(const child of Object.values(value))if(typeof child==='object')walk(child);
 }walk(data);return videos;
}
