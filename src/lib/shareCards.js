import QRCode from 'qrcode';
import {getAnimeImageUrl} from './media';
export function profileUrl(uid){return `https://otoverse.games/profile/${encodeURIComponent(uid)}`;}
const loadImage=src=>new Promise(resolve=>{if(!src){resolve(null);return;}const img=new Image();img.crossOrigin='anonymous';const timeout=setTimeout(()=>resolve(null),5000);img.onload=()=>{clearTimeout(timeout);resolve(img);};img.onerror=()=>{clearTimeout(timeout);resolve(null);};img.src=src;});
export async function createShareCard({kind,name='ผู้เล่น',items=[],score=0,total=0,streak=0,mode='Anime Quiz',url='https://otoverse.games/'}){
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1920;const ctx=canvas.getContext('2d');
 const gradient=ctx.createLinearGradient(0,0,1080,1920);gradient.addColorStop(0,'#141c38');gradient.addColorStop(.55,'#18112f');gradient.addColorStop(1,'#080e20');ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,1920);
 const glow=ctx.createRadialGradient(950,120,0,950,120,800);glow.addColorStop(0,'#7350e766');glow.addColorStop(1,'#7350e700');ctx.fillStyle=glow;ctx.fillRect(0,0,1080,1920);
 const text=(value,x,y,size=32,color='#eff1ff',weight=600)=>{ctx.font=`${weight} ${size}px "Noto Sans Thai", sans-serif`;ctx.fillStyle=color;ctx.fillText(value,x,y);};
 const fit=(value,max)=>{let t=String(value||'');while(ctx.measureText(t).width>max&&t.length)t=t.slice(0,-1);return t===String(value||'')?t:t+'…';};
 text('OtoVerse',72,130,53,'#64daff',800);text('ANIME • MUSIC • YOUR VERSE',74,183,19,'#a1acc8');
 text(kind==='top'?'MY TOP 5 ANIME':'GUESS THE ANIME',72,305,51,'#fff',800);ctx.font='600 30px sans-serif';text(fit(name,890),72,364,30,'#b9a6ff');
 if(kind==='result'){
  text(mode,72,445,26,'#a1acc8');text(`${score} / ${total}`,72,650,144,'#fff',800);text('เพลงที่ตอบถูก',80,708,35,'#c3b7e9');
  ctx.fillStyle='#ffffff0c';ctx.fillRect(72,770,936,138);text('BEST STREAK',102,822,23,'#9aa9ca');text(`${streak} ติดกัน`,102,874,35,'#7ee5dd',800);text('เพลงในรอบนี้',72,1000,30,'#c8cde5');
 }
 const images=await Promise.all(items.slice(0,5).map(a=>loadImage(getAnimeImageUrl(a))));
 const start=kind==='top'?430:1050;const height=kind==='top'?195:100;const count=kind==='top'?5:3;
 for(let i=0;i<Math.min(items.length,count);i++){
  const y=start+i*(height+18);ctx.fillStyle='#ffffff09';ctx.fillRect(72,y,936,height);
  const img=images[i];const side=height-24;ctx.fillStyle='#302651';ctx.fillRect(84,y+12,side,side);
  if(img){const crop=Math.min(img.width,img.height);ctx.drawImage(img,(img.width-crop)/2,(img.height-crop)/2,crop,crop,84,y+12,side,side);}
  text(String(i+1).padStart(2,'0'),103+side,y+48,22,'#9f87f4',800);ctx.font=`700 ${kind==='top'?30:24}px sans-serif`;const title=String(items[i].animeTitle||items[i].title||'').replace(/\s*\((OP|ED)\d*\)\s*$/i,'');text(fit(title,680-side),103+side,y+(height/2)+25,kind==='top'?30:24,'#fff',700);
 }
 const qr=await loadImage(await QRCode.toDataURL(url,{width:190,margin:1,errorCorrectionLevel:'M',color:{dark:'#141c38',light:'#ffffff'}}));if(qr)ctx.drawImage(qr,72,1570,190,190);
 text('YOUR NEXT ANIME SONG',305,1623,25,'#ab99e3');text('otoverse.games',305,1681,39,'#fff',800);text(kind==='top'?'สแกนเพื่อดูโปรไฟล์และเรื่องแนะนำ':'สแกนแล้วลองทายเพลงด้วยกัน',305,1732,25,'#aab5d2');text('MADE FOR ANIME LOVERS',72,1838,19,'#707e9e');
 return canvas;
}
