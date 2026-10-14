import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('src/lib/adminContent.js','utf8').replace(/^import[\s\S]*?;\s*/gm,'').replace(/\bexport /g,'');
function setup(song){let patch;const context={module:{exports:{}},firebaseDb:{},doc:()=>({}),getDoc:async()=>({exists:()=>true,data:()=>song}),updateDoc:async(_,data)=>{patch=data;},serverTimestamp:()=> 'now',getYouTubeId:x=>String(x||'')};vm.runInNewContext(source+'\nmodule.exports=setAnimeSongActive;',context);return {toggle:context.module.exports,patch:()=>patch};}
test('enabling a reviewed song updates only status fields, preserves title and video',async()=>{const s=setup({title:'Anime (ED2)',youtubeVideoId:'abcdefghijk',isActive:false,videoReviewReason:'Needs review'});await s.toggle('song',true);assert.equal(s.patch().isActive,true);assert.equal(s.patch().videoReviewReason,'');assert.equal(s.patch().title,undefined);assert.equal(s.patch().youtubeVideoId,undefined);});
test('enabling missing video or metadata is rejected',async()=>{await assert.rejects(setup({youtubeVideoId:''}).toggle('song',true));await assert.rejects(setup({entryType:'metadata'}).toggle('info',true));});
test('disabling a song works without a video and retains review reason',async()=>{const s=setup({youtubeVideoId:'',videoReviewReason:'Invalid video'});await s.toggle('song',false);assert.equal(s.patch().isActive,false);assert.equal(s.patch().videoReviewReason,undefined);});
