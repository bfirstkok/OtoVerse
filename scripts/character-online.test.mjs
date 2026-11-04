import {test} from 'node:test';
import assert from 'node:assert/strict';
import Module, {createRequire} from 'node:module';
import {startGame} from '../functions/character-engine.mjs';
const require=createRequire(import.meta.url);
const rooms=new Map();
const ref=id=>({id,get:async()=>({data:()=>rooms.get(id)}),create:async data=>{rooms.set(id,data);}});
const db={collection:()=>({doc:ref}),runTransaction:async callback=>callback({get:async r=>r.get(),update:(r,data)=>rooms.set(r.id,{...rooms.get(r.id),...data})})};
const original=Module._load;
Module._load=function(name,...args){
 if(name==='firebase-functions/v2/https') return {onCall:(_,fn)=>fn,HttpsError:class extends Error{constructor(code,message){super(message);this.code=code;}}};
 if(name==='firebase-admin/firestore') return {getFirestore:()=>db};
 return original.call(this,name,...args);
};
const {characterChallenge:handler}=require('../functions/character-challenge.js');
Module._load=original;
const code='ABCDEF123456';
const call=(uid,data)=>handler({auth:uid?{uid}:null,data:{roomId:code,...data}});
const seed=()=>rooms.set(code,{...startGame([{id:'a',name:'A'},{id:'b',name:'B'}]),memberIds:['a','b'],letter:'E'});
test('callable requires authentication and validates room IDs',async()=>{
 await assert.rejects(call(null,{action:'create'}),{code:'unauthenticated'});
 await assert.rejects(call('a',{action:'join',roomId:'../rooms'}),{code:'invalid-argument'});
});
test('create, join, and room capacity',async()=>{
 const created=await call('host',{action:'create',nickname:'Host'});
 assert.match(created.roomId,/^[A-F0-9]{12}$/);
 await call('guest',{action:'join',roomId:created.roomId});
 assert.equal(rooms.get(created.roomId).status,'playing');
 assert.deepEqual(rooms.get(created.roomId).players.map(p=>p.hearts),[2,2]);
 await assert.rejects(call('third',{action:'join',roomId:created.roomId}),{code:'failed-precondition'});
});
test('outsiders, wrong turns, and stale submissions cannot mutate state',async()=>{
 seed();const before=structuredClone(rooms.get(code));
 await assert.rejects(call('other',{action:'answer',answer:'',revision:0}),{code:'permission-denied'});
 await assert.rejects(call('b',{action:'answer',answer:'',revision:0}),{code:'failed-precondition'});
 await assert.rejects(call('a',{action:'answer',answer:'',revision:99}),{code:'failed-precondition'});
 assert.deepEqual(rooms.get(code),before);
});
test('server validates catalog answers and enforces reveal deadline',async()=>{
 seed();await call('a',{action:'answer',answer:'Eren Yeager',revision:0});
 const s=rooms.get(code);assert.equal(s.lastCorrect,true);assert.equal(s.turn,1);
 assert.ok(s.revealUntil>Date.now());assert.equal(s.players[0].hearts,2);
 await assert.rejects(call('b',{action:'answer',answer:'',revision:1}),{code:'failed-precondition'});
});
test('server rejects replay; forfeits and leaving work',async()=>{
 seed();await call('a',{action:'answer',answer:'',revision:0});
 assert.equal(rooms.get(code).players[0].hearts,1);
 await assert.rejects(call('a',{action:'answer',answer:'',revision:0}),{code:'failed-precondition'});
 await call('b',{action:'leave'});assert.equal(rooms.get(code).status,'closed');
});
