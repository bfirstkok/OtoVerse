import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startGame,applyAnswer,lookupCharacter,normalize,randomLetter} from '../functions/character-engine.mjs';
const players=[{id:'a',name:'A'},{id:'b',name:'B'}];
const eren={id:'eren',name:'Eren Yeager',aliases:[],anime:'Attack on Titan',video:'euX_8PYBvr4'};
const initial=()=>({...startGame(players),letter:'E'});
test('two hearts and all English letters',()=>{
 assert.deepEqual(startGame(players).players.map(p=>p.hearts),[2,2]);
 for(let i=0;i<26;i++)assert.equal(randomLetter(()=>(i+0.5)/26),String.fromCharCode(65+i));
 assert.throws(()=>startGame([players[0]]));
});
test('correct answer reveals for exactly six seconds and alternates turns',()=>{
 const s=initial(); const next=applyAnswer(s,eren,1000,()=>0);
 assert.equal(next.turn,1);assert.equal(next.revealUntil,7000);assert.equal(next.reveal.name,eren.name);
 assert.deepEqual(next.players.map(p=>p.hearts),[2,2]);assert.equal(next.letter,'A');
 assert.throws(()=>applyAnswer(next,null,6999));assert.equal(applyAnswer(next,null,7000).players[1].hearts,1);
 assert.equal(s.used.length,0);
});
test('wrong, duplicate, and wrong-letter answers cost heart; zero ends game',()=>{
 let s=applyAnswer(initial(),null,0); assert.equal(s.players[0].hearts,1);
 s=applyAnswer(s,null,1);s=applyAnswer(s,null,2);
 assert.equal(s.status,'finished');assert.equal(s.players[0].hearts,0);assert.throws(()=>applyAnswer(s,null,3));
 assert.equal(applyAnswer({...initial(),used:['eren']},eren,0).lastCorrect,false);
 assert.equal(applyAnswer({...initial(),letter:'X'},eren,0).lastCorrect,false);
});
test('exact normalized catalog validation; no partial-name matches',async()=>{
 assert.equal(normalize(' Éren  YEAGER! '),'erenyeager');
 assert.equal(await lookupCharacter('eren yeager',[eren],()=>assert.fail('should use catalog')),eren);
 const fetcher=async()=>({ok:true,json:async()=>({data:[]})});
 assert.equal(await lookupCharacter('Eren',[eren],fetcher),null);
});
test('API failures preserve game; manga-only and fuzzy matches rejected',async()=>{
 const s=initial();
 await assert.rejects(lookupCharacter('Unknown',[],async()=>({ok:false})));
assert.equal(s.players[0].hearts,2);
 const response=data=>({ok:true,json:async()=>({data})});
 let i=0;const fetcher=async()=>response(i++===0?[{mal_id:1,name:'Unknown',nicknames:[]}]:[]);
 assert.equal(await lookupCharacter('Unknown',[],fetcher),null);
});
test('MAL family-name order and nicknames accepted with anime association',async()=>{
 const responses=[[{mal_id:1,name:'Uzumaki, Naruto',nicknames:['Naruto']}],[{anime:{title:'Naruto'}}]];
 const found=await lookupCharacter('Naruto Uzumaki',[],async()=>({ok:true,json:async()=>({data:responses.shift()})}));
 assert.equal(found.id,'mal:1');assert.equal(found.anime,'Naruto');
});
