// génère les icônes PNG de l'app sans dépendance externe
const fs=require("fs"),zlib=require("zlib");
function png(size,path){
  const W=size,H=size,px=Buffer.alloc(W*H*4);
  const bleu=[0x2B,0x4A,0x7A],creme=[0xFC,0xFB,0xF7],cuivre=[0xA8,0x5B,0x2C];
  const r=Math.round(size*0.22);                     // coins arrondis
  const m=Math.round(size*0.20);                     // marge du calendrier
  const teteH=Math.round(size*0.13);                 // bandeau du calendrier
  const set=(x,y,c,a=255)=>{const o=(y*W+x)*4;px[o]=c[0];px[o+1]=c[1];px[o+2]=c[2];px[o+3]=a;};
  const dansCoin=(x,y)=>{ // rectangle arrondi plein écran
    const cx=Math.min(Math.max(x,r),W-1-r),cy=Math.min(Math.max(y,r),H-1-r);
    return (x-cx)**2+(y-cy)**2<=r*r;
  };
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    if(!dansCoin(x,y)){set(x,y,[0,0,0],0);continue;}
    set(x,y,bleu);
    const dedans=x>=m&&x<W-m&&y>=m&&y<H-m;
    if(dedans){
      set(x,y, y<m+teteH?cuivre:creme);
      if(y>=m+teteH){                                // grille de points 3x3
        const gx=(x-m)/(W-2*m),gy=(y-m-teteH)/(H-m-(m+teteH));
        const c=Math.floor(gx*3),l=Math.floor(gy*3);
        const px0=(c+0.5)/3,py0=(l+0.5)/3;
        const d=((gx-px0)*(W-2*m))**2+((gy-py0)*(H-m-(m+teteH)))**2;
        if(d<(size*0.045)**2)set(x,y,bleu);
      }
    }
  }
  // encodage PNG
  const raw=Buffer.alloc((W*4+1)*H);
  for(let y=0;y<H;y++){raw[y*(W*4+1)]=0;px.copy(raw,y*(W*4+1)+1,y*W*4,(y+1)*W*4);}
  const crcT=[...Array(256)].map((_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;return c>>>0;});
  const crc=b=>{let c=0xFFFFFFFF;for(const v of b)c=crcT[(c^v)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;};
  const chunk=(type,data)=>{const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const td=Buffer.concat([Buffer.from(type),data]);const cr=Buffer.alloc(4);cr.writeUInt32BE(crc(td));return Buffer.concat([len,td,cr]);};
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(W,0);ihdr.writeUInt32BE(H,4);ihdr[8]=8;ihdr[9]=6;
  fs.writeFileSync(path,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",ihdr),chunk("IDAT",zlib.deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]));
  console.log(path,size+"x"+size,fs.statSync(path).size+" octets");
}
png(192,"icone-192.png");png(512,"icone-512.png");png(180,"icone-apple.png");
