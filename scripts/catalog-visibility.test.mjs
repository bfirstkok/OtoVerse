import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
test('catalog rows cannot activate inactive songs or metadata in quiz',()=>{
 const source=readFileSync('anime_op_quiz_starter.jsx','utf8');
 const expression=source.match(/const playableItems = ([^;]+);/)[1];
 const normalized=[{id:'active',isActive:true,youtubeVideoId:'abcdefghijk'},{id:'inactive',isActive:false,youtubeVideoId:'abcdefghijk'},{id:'metadata',entryType:'metadata',isActive:true,youtubeVideoId:'abcdefghijk'},{id:'pending',isActive:false,youtubeVideoId:''}];
 const result=vm.runInNewContext(expression,{normalized,getYouTubeId:x=>x});assert.deepEqual(result.map(x=>x.id),['active']);
});
