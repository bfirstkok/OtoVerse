import { createRequire } from 'node:module';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { malDraft } from '../src/lib/myAnimeList.js';
import { isDuplicate, parseThemes, videoCandidates } from './mal-bulk-utils.mjs';

const require = createRequire(import.meta.url);
const cheerio = require('../server/mascot-api/node_modules/cheerio');
const { parseAnime } = require('../server/mascot-api/lib/mal-source');
const cliRoot = process.env.FIREBASE_CLI_ROOT;
if (!cliRoot) throw new Error('Set FIREBASE_CLI_ROOT to the installed firebase-tools directory.');
const { configstore } = require(join(cliRoot, 'lib/configstore.js'));
const { getAccessToken } = require(join(cliRoot, 'lib/auth.js'));
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? Number(args[args.indexOf(name)+1]) : fallback;
const pages = option('--pages', 1), offset = option('--offset', 0);
const apply = args.includes('--apply');
if (!Number.isInteger(pages) || pages < 1 || !Number.isInteger(offset) || offset < 0) throw new Error('Invalid pagination');
const dir = '.firebase/mal-import'; mkdirSync(dir, { recursive: true });
const endpoint = 'https://firestore.googleapis.com/v1/projects/animequiz-8a93b/databases/(default)/documents';
async function auth() { return (await getAccessToken(configstore.get('tokens').refresh_token, [])).access_token; }
async function firestore(path, init = {}) {
 const response = await fetch(endpoint+path, { ...init, headers: { Authorization: 'Bearer '+await auth(), 'Content-Type':'application/json', ...init.headers }, signal: AbortSignal.timeout(30000) });
 const result = await response.json(); if(!response.ok) throw new Error('Firestore '+response.status+': '+result.error?.message); return result;
}
const decode = value => value.stringValue ?? value.timestampValue ?? (value.integerValue !== undefined ? Number(value.integerValue) : value.booleanValue ?? (value.arrayValue ? (value.arrayValue.values || []).map(decode) : null));
const encode = value => typeof value==='string' ? {stringValue:value} : typeof value==='boolean' ? {booleanValue:value} : typeof value==='number' ? {integerValue:String(Math.trunc(value))} : Array.isArray(value) ? {arrayValue:{values:value.map(encode)}} : {nullValue:null};
const existing=[]; let next='';
do { const result = await firestore('/animeSongs?pageSize=300'+(next?'&pageToken='+encodeURIComponent(next):'')); existing.push(...(result.documents||[]).map(doc=>({id:doc.name.split('/').pop(),_updateTime:doc.updateTime,...Object.fromEntries(Object.entries(doc.fields||{}).map(([k,v])=>[k,decode(v)]))}))); next=result.nextPageToken; } while(next);
writeFileSync(join(dir, 'backup-'+Date.now()+'.json'), JSON.stringify(existing));
if(args.includes('--apply-summaries')) {
 const summaries=JSON.parse(readFileSync('public/mal-synopsis-th.json','utf8')).items;let count=0;
 for(const row of existing){const summary=summaries[row.malId];if(!summary || row.importSource!=='MyAnimeList bulk' || row.updatedAt || row.synopsis===summary.text)continue;
  await firestore(':commit',{method:'POST',body:JSON.stringify({writes:[{update:{name:endpoint.replace('https://firestore.googleapis.com/v1/','')+'/animeSongs/'+row.id,fields:{synopsis:encode(summary.text),synopsisSource:encode(summary.source)}},updateMask:{fieldPaths:['synopsis','synopsisSource']},currentDocument:{updateTime:row._updateTime}}]})});count++;
 }console.log(JSON.stringify({summariesApplied:count}));process.exit(0);
}
const stats={existing:existing.length, scanned:0, duplicates:0, newAnime:0, songs:0, playable:0, pending:0, errors:[], pages:0};
async function get(url) {
 const response=await fetch(url,{headers:{'Accept-Language':'en-US,en;q=0.9'},signal:AbortSignal.timeout(18000)});
 if(!response.ok)throw new Error('Source HTTP '+response.status);return response.text();
}
async function findVideo(song) {
 const cachePath=join(dir,'youtube-v2-'+Buffer.from(song.artist+' '+song.songTitle).toString('base64url').slice(0,180)+'.json');
 if(existsSync(cachePath))return JSON.parse(readFileSync(cachePath,'utf8'));
 let candidates=[];
 if(song.sourceVideo){const match=song.sourceVideo.match(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/);if(match)candidates=[{id:match[1],title:song.songTitle,channel:'MyAnimeList link'}];}
 if(!candidates.length){const html=await get('https://www.youtube.com/results?hl=en&search_query='+encodeURIComponent(song.artist+' '+song.songTitle+' official'));const match=html.match(/var ytInitialData = (\{.*?\});<\/script>/s);if(match)candidates=videoCandidates(JSON.parse(match[1]),song);}
 for(const candidate of candidates.slice(0,3)){
  const html=await get('https://www.youtube.com/watch?hl=en&v='+candidate.id);const match=html.match(/var ytInitialPlayerResponse = (\{.*?\});/s);if(!match)continue;
  const player=JSON.parse(match[1]);const seconds=Number(player.videoDetails?.lengthSeconds);
  if(player.playabilityStatus?.status==='OK' && player.playabilityStatus.playableInEmbed===true && seconds>=60 && seconds<=600 && !player.videoDetails?.isLiveContent){writeFileSync(cachePath,JSON.stringify(candidate));return candidate;}
 }
 writeFileSync(cachePath,'null');return null;
}
const report=[];
for(let page=0;page<pages;page++){
 const start=offset+page*50;const $=cheerio.load(await get('https://myanimelist.net/topanime.php?type=bypopularity&limit='+start));
 const ids=[...new Set($('a.hoverinfo_trigger').map((_,el)=>Number(($(el).attr('href')||'').match(/\/anime\/(\d+)/)?.[1])).get().filter(Boolean))];
 if(!ids.length){if(start===0)throw new Error('Ranking unavailable; no entries parsed');break;}
 const processAnime=async id=>{
  stats.scanned++;
  try{
   const path=join(dir,'mal-v2-'+id+'.json');let anime,songs;
   if(existsSync(path)){({anime,songs}=JSON.parse(readFileSync(path,'utf8')));}else{
    const page=cheerio.load(await get('https://myanimelist.net/anime/'+id));anime=parseAnime(page,id);songs=parseThemes(page);
    if(!anime.trailer?.youtube_id){try{const video=cheerio.load(await get('https://myanimelist.net/anime/'+id+'/video'));anime.trailer.youtube_id=(video('a.video-unit.promotion').first().attr('href')||'').match(/\/embed\/([\w-]{11})/)?.[1]||null;}catch{}}
    writeFileSync(path,JSON.stringify({anime,songs}));
   }
   if(isDuplicate(anime,existing)){stats.duplicates++;return;}
   // No existing record is overwritten. Distinct MAL IDs retain separate seasons.
   const draft=malDraft(anime);const shared={...draft,altTitles:draft.altTitles.split('\n').filter(Boolean),year:Number(draft.year)||null,genreSource:'manual',difficulty:'medium',acceptedAnswers:[anime.title,...draft.altTitles.split('\n').filter(Boolean)],characters:[],note:'',importSource:'MyAnimeList bulk',importedAt:new Date().toISOString()};
   if(anime.genres.some(genre=>['Hentai','Erotica'].includes(genre.name)))return;
   const entries=songs.length?songs:[{songType:'',songNumber:0,songTitle:'',artist:''}];let ready=0;const writes=[];
   const videos=new Map();
   for(let index=0;index<entries.length;index+=3)await Promise.all(entries.slice(index,index+3).map(async song=>{let video=null;try{if(song.songTitle)video=await findVideo(song);}catch{/* Uncertain or inaccessible videos stay pending. */}videos.set(song,video);}));
   for(const song of entries){const video=videos.get(song);
    const docId='mal-'+id+'-'+(song.songType?song.songType.toLowerCase()+song.songNumber:'info');
    const payload={...shared,title:anime.title+(song.songType?' ('+song.songType+song.songNumber+')':''),songType:song.songType,songNumber:song.songNumber,songTitle:song.songTitle,artist:song.artist,youtubeVideoId:video?.id||'',isActive:!!video,importStatus:video?'verified-video':song.songTitle?'needs-video':'metadata-only',videoSource:video?'https://www.youtube.com/watch?v='+video.id:'',videoChannel:video?.channel||''};
    writes.push({update:{name:endpoint.replace('https://firestore.googleapis.com/v1/','')+'/animeSongs/'+docId,fields:Object.fromEntries(Object.entries(payload).map(([k,v])=>[k,encode(v)]))},currentDocument:{exists:false}});
    report.push({id:docId,title:payload.title,song:song.songTitle,artist:song.artist,video:video?.id||null,status:payload.importStatus});stats.songs+=song.songTitle?1:0;if(video){stats.playable++;ready++;}else stats.pending++;
   }
   if(apply)await firestore(':commit',{method:'POST',body:JSON.stringify({writes})});
   stats.newAnime++;existing.push({...shared,malId:id});
   console.log(JSON.stringify({title:anime.title,id,songs:songs.length,ready,total:stats.newAnime}));
   writeFileSync(join(dir,'report-'+offset+'.json'),JSON.stringify({apply,offset,stats,entries:report},null,2));
   await new Promise(resolve=>setTimeout(resolve,1000));
  }catch(error){stats.errors.push({id,message:error.message});console.log(JSON.stringify({error:id,message:error.message}));}
 };
 for(let batch=0;batch<ids.length;batch+=2)await Promise.all(ids.slice(batch,batch+2).map(processAnime));
 stats.pages++;
 console.log(JSON.stringify({page:start,stats}));
}
writeFileSync(join(dir,'report-'+offset+'.json'),JSON.stringify({apply,offset,stats,entries:report},null,2));
console.log(JSON.stringify({done:true,apply,stats}));
