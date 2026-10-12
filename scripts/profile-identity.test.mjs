import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync('src/lib/profiles.js','utf8').replace(/^import[\s\S]*?;\s*/gm,'').replace(/\bexport /g,'');
async function login(existing,auth){
 let written;
 const context={module:{exports:{}},firebaseReady:true,firebaseDb:{},doc:()=>({}),serverTimestamp:()=> 'now',getDocFromServer:async()=>({exists:()=>true,data:()=>existing}),updateDoc:async(_ref,updates)=>{written=updates;}};
 vm.runInNewContext(source+'\nmodule.exports=ensureProfile;',context);
 await context.module.exports('uid',auth);
 return written;
}
test('signing in preserves custom avatar and nickname',async()=>{
 const changes=await login({photoURL:'data:image/webp;base64,custom',nickname:'Otto'}, {photoURL:'https://provider.example/avatar',displayName:'Provider'});
 assert.equal(changes.photoURL,undefined);assert.equal(changes.nickname,undefined);
});
test('missing provider details cannot erase existing profile identity',async()=>{
 const changes=await login({email:'saved@example.test',displayName:'Saved',nickname:'Saved'},{});
 assert.equal(changes.email,undefined);assert.equal(changes.displayName,undefined);
});
test('older profiles receive missing avatar and blank nickname',async()=>{
 const changes=await login({nickname:'  ',photoURL:''},{displayName:'Otto',photoURL:'https://provider.example/avatar'});
 assert.equal(changes.nickname,'Otto');assert.equal(changes.photoURL,'https://provider.example/avatar');
});
