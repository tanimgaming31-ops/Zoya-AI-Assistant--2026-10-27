// Generates PWA PNG icons without any extra npm dependency.
import {deflateSync} from 'node:zlib';
import {writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let j=0;j<8;j++)c=c&1?0xEDB88320^(c>>>1):c>>>1;return c>>>0;});
function crc(buf){let c=0xFFFFFFFF;for(const n of buf)c=crcTable[(c^n)&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0;}
function chunk(type,data){const tag=Buffer.from(type);const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const check=Buffer.alloc(4);check.writeUInt32BE(crc(Buffer.concat([tag,data])));return Buffer.concat([len,tag,data,check]);}
const glyph=['1111111','0000011','0000110','0001100','0011000','0110000','1111111'];
function icon(size){
 const pixels=Buffer.alloc(size*(1+size*4));
 for(let y=0;y<size;y++){
  const o=y*(1+size*4);pixels[o]=0;
  for(let x=0;x<size;x++){
   const dx=(x-size/2)/(size/2),dy=(y-size/2)/(size/2),rad=Math.sqrt(dx*dx+dy*dy);
   const glow=Math.max(0,1-rad);const fx=x/size,fy=y/size;
   let r=Math.min(255,Math.round(8+34*fy+68*glow)),g=Math.round(5+13*fx+22*glow),b=Math.round(19+74*fx+117*glow);
   const gx=Math.floor((fx-.28)/.44*7),gy=Math.floor((fy-.29)/.42*7);
   if(gx>=0&&gx<7&&gy>=0&&gy<7&&glyph[gy][gx]==='1'){r=250;g=229;b=255;}
   const p=o+1+x*4;pixels[p]=r;pixels[p+1]=g;pixels[p+2]=b;pixels[p+3]=255;
  }
 }
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=6;
 const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(pixels,{level:9})),chunk('IEND',Buffer.alloc(0))]);
 return png;
}
mkdirSync('public',{recursive:true});
for(const size of [48,72,96,144,192,512]){const target=join('public',`icon-${size}.png`);writeFileSync(target,icon(size));console.log('Generated',target);}
