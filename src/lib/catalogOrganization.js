import seasonLabels from "./catalogSeasonLabels.json" with {type:"json"};
export const SONG_STATUS_LABELS = {ready:'พร้อมเล่น',pending:'รอวิดีโอ',review:'ต้องตรวจสอบ'};
export function isCatalogSong(item) { return item?.entryType !== 'metadata' && /\((?:OP|ED)\s*\d*\)\s*$/i.test(String(item?.title || '')); }
export function catalogSeriesKey(item) {
 const malId=Number(item?.malId);
 if(Number.isInteger(malId)&&malId>0)return `mal:${malId}`;
 return String(item?.animeTitle||item?.title||'').replace(/\s*\((?:OP|ED)\s*\d*\)\s*$/i,'').trim().toLowerCase().replace(/\s+/g,' ');
}
export function songStatus(item) {
 if(!isCatalogSong(item))return null;
 if(item.videoReviewReason||item.catalogReviewReason)return 'review';
 const value=String(item.youtubeVideoId||'').trim();
 const id=value.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/)([\w-]{11})/)?.[1]||value;
 if(!/^[\w-]{11}$/.test(id))return 'pending';
 return item.isActive===false?'review':'ready';
}
export function groupCatalogItems(items) {
 const groups=new Map();
 for(const item of items){const key=catalogSeriesKey(item)||String(item.id);if(!groups.has(key))groups.set(key,{key,items:[]});groups.get(key).items.push(item);}
 return [...groups.values()].map(group=>{
  const metadata=group.items.find(item=>item.entryType==='metadata');
  const primary=metadata||group.items[0];
  const songs=group.items.filter(isCatalogSong).sort((a,b)=>String(a.songType||'').localeCompare(String(b.songType||''))||Number(a.songNumber)-Number(b.songNumber));
  return {...group,primary,songs,title:catalogDisplayTitle(primary)};
 }).sort((a,b)=>a.title.localeCompare(b.title,'th',{numeric:true}));
}

export function catalogDisplayTitle(item) {
 const base=String(item?.animeTitle||item?.title||'').replace(/\s*\((?:OP|ED)\s*\d*\)\s*$/i,'').trim();
 const source=seasonLabels[item?.malId];
 return !item?.updatedAt && source && base === source.sourceTitle ? source.label : base;
}
