const cheerio = require('cheerio');
const cache = new Map();
async function html(url) {
 const response=await fetch(url,{signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new Error('MAL unavailable');
 const content=await response.text();if(content.length>2500000)throw new Error('MAL page too large');return cheerio.load(content);
}
function parseAnime($,id) {
 const title=$('h1.title-name strong').first().text().trim() || $('h1[itemprop="name"]').first().text().trim();
 const synopsis=$('p[itemprop="description"]').first().text().trim();
 if(!title || !synopsis)throw new Error('MAL anime markup unavailable');
 const fields={};$('.spaceit_pad').each((_,el)=>{const label=$(el).find('.dark_text').first().text().trim().replace(/:$/,'');if(label)fields[label]=$(el).clone().children('.dark_text').remove().end().text().trim();});
 const genres=$('[itemprop="genre"]').map((_,el)=>({name:$(el).text().trim()})).get();
 let video='';$('a[href],iframe[src]').each((_,el)=>{if(video)return;const value=$(el).attr('href')||$(el).attr('src');const match=value?.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/);if(match)video=match[1];});
 const image=$('img[itemprop="image"]').first().attr('data-src')||$('img[itemprop="image"]').first().attr('src')||'';
 const year=Number(fields.Aired?.match(/\b(?:19|20)\d{2}\b/)?.[0])||null;
 return {mal_id:id,title,title_english:fields.English||'',title_japanese:fields.Japanese||'',title_synonyms:fields.Synonyms?.split(',').map(x=>x.trim())||[],synopsis,year,genres,themes:[],images:{jpg:{image_url:image,large_image_url:image}},trailer:{youtube_id:video||null},_source:'MyAnimeList'};
}
async function direct(id,query){
 if(id){
  const data=parseAnime(await html(`https://myanimelist.net/anime/${id}`),id);
  if(!data.trailer.youtube_id){try{const $=await html(`https://myanimelist.net/anime/${id}/video`);const link=$('a.video-unit.promotion').first().attr('href')||'';data.trailer.youtube_id=link.match(/^https:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{11})(?:[?/#]|$)/)?.[1]||null;}catch{/* Metadata remains usable when no trailer is accessible. */}}
  return {data};
 }
 const $=await html(`https://myanimelist.net/anime.php?q=${encodeURIComponent(query)}&cat=anime`);const seen=new Set(),data=[];
 $('a.hoverinfo_trigger.fw-b').each((_,el)=>{const link=$(el).attr('href')||'';const match=link.match(/^https:\/\/myanimelist\.net\/anime\/(\d+)(?:\/|$)/);if(!match)return;const mal_id=Number(match[1]);if(seen.has(mal_id))return;seen.add(mal_id);const row=$(el).closest('tr');data.push({mal_id,title:$(el).text().trim(),images:{jpg:{image_url:row.find('img').first().attr('data-src')||row.find('img').first().attr('src')||''}},_source:'MyAnimeList'});});
 return {data:data.slice(0,8)};
}
async function fetchMal({id,query}) {
 const key=id?`id:${id}`:`q:${query}`;const cached=cache.get(key);if(cached&&cached.until>Date.now())return cached.value;
 let value;
 try {const path=id?`anime/${id}`:`anime?q=${encodeURIComponent(query)}&limit=8&sfw=true`;const r=await fetch(`https://api.jikan.moe/v4/${path}`,{signal:AbortSignal.timeout(3500)});if(!r.ok)throw new Error('Jikan unavailable');value=await r.json();if(id&&!value.data?.title)throw new Error('invalid data');}
 catch {value=await direct(id,query);}
 if(cache.size>=200)cache.delete(cache.keys().next().value);cache.set(key,{value,until:Date.now()+3600000});return value;
}
module.exports={fetchMal,parseAnime};
