export const REVEAL_MS = 6000;
export const normalize = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
export function names(character) {
 const result = [character.name, ...(character.aliases || [])];
 if (character.name.includes(',')) result.push(character.name.split(',').reverse().map(x => x.trim()).join(' '));
 return result;
}
export function randomLetter(random = Math.random) { return String.fromCharCode(65 + Math.floor(random() * 26)); }
export function startGame(players, random = Math.random) {
 if (players.length !== 2) throw Error('ต้องมีผู้เล่น 2 คน');
 return {players: players.map(p => ({...p, hearts: 2})), turn: 0, letter: randomLetter(random), used: [], revision: 0, status: 'playing', reveal: null, revealUntil: 0};
}
export function applyAnswer(state, character, now = Date.now(), random = Math.random) {
 if (state.status !== 'playing' || now < state.revealUntil) throw Error('ยังไม่ถึงตาถัดไป');
 const correct = !!character && !state.used.includes(character.id) && names(character).some(n => normalize(n).startsWith(state.letter.toLowerCase()));
 const players = state.players.map((p,i) => ({...p, hearts: p.hearts - (i === state.turn && !correct ? 1 : 0)}));
 return {...state, players, turn: 1-state.turn, letter: randomLetter(random), revision: state.revision+1,
  used: correct ? [...state.used, character.id] : state.used,
  status: players.some(p => p.hearts === 0) ? 'finished' : 'playing',
  reveal: correct ? character : null, revealUntil: correct ? now+REVEAL_MS : 0, lastCorrect: correct};
}
export async function lookupCharacter(answer, catalog, fetcher = fetch) {
 const key = normalize(answer);
 if (!key || key.length > 100) return null;
 const found = catalog.find(c => names(c).some(n => normalize(n) === key));
 if (found) return found;
 async function api(path) {
  const response = await fetcher('https://api.jikan.moe/v4/'+path, {signal: AbortSignal.timeout(12000)});
  if (!response.ok) throw Error('บริการค้นหาตัวละครไม่พร้อม กรุณาลองใหม่ (ไม่เสียหัวใจ)');
  return (await response.json()).data;
 }
 const results = await api('characters?q='+encodeURIComponent(answer)+'&limit=25');
 const match = results.find(c => names({name:c.name, aliases:c.nicknames}).some(n => normalize(n) === key));
 if (!match) return null;
 const appearances = await api('characters/'+match.mal_id+'/anime');
 if (!appearances.length) return null;
 const anime = appearances[0].anime;
 const song = catalog.find(c => normalize(c.anime).includes(normalize(anime.title)));
 return {id:'mal:'+match.mal_id, name:match.name, aliases:match.nicknames || [], image:match.images?.jpg?.image_url || '', anime:anime.title, video:song?.video || ''};
}
