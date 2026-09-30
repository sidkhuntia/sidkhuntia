const fs=require('fs');
const H=[];for(let i=0;i<52;i++)H.push(Math.max(.08,Math.abs(Math.sin(i*.55)*Math.cos(i*.17))*(.45+.55*Math.abs(Math.sin(i*1.9+2)))));
const bars=(hgt,col,anim)=>`<svg viewBox="0 0 640 ${hgt}" width="100%">`+H.map((h,i)=>{const b=h*(hgt-8),d=(i%7)*.13,u=.9+(i%5)*.25;return `<rect x="${i*12.3+4}" y="${hgt/2-b/2}" width="7" height="${b}" rx="3.5" fill="${col}" opacity="${(.4+h*.6).toFixed(2)}"${anim?` style="transform-box:fill-box;transform-origin:center;animation:bump ${u}s ease-in-out ${d}s infinite"`:''}/>`}).join('')+`</svg>`;
const wave=()=>{let t='M0,35',b='';H.forEach((h,k)=>t+=` L${k*12.3+8},${35-h*30}`);for(let k=51;k>=0;k--)b+=` L${k*12.3+8},${35+H[k]*30}`;return `<svg viewBox="0 0 640 70" width="100%"><path d="${t+b} Z" fill="#7F77DD" opacity=".75"/></svg>`};
const L=[['Java',46],['TypeScript',28],['Python',14],['JavaScript',8],['Other',4]];
const mix=L.map(([n,p])=>`<div class="m"><span class="mono" style="width:90px">${n}</span><div style="flex:1;display:flex;gap:2px">${Array.from({length:24},(_,q)=>`<i style="flex:1;height:8px;border-radius:2px;background:${q<Math.round(p/100*24*1.6)?'#222':'#ddd'}"></i>`).join('')}</div><span class="mono" style="width:34px;text-align:right;color:#888">${p}%</span></div>`).join('');
const pills=['X / Twitter','LinkedIn','LeetCode','Codeforces','Email'].map(x=>`<span class="pill">${x}</span>`).join('');
fs.writeFileSync('.preview/index.html',`<!doctype html><meta charset=utf-8><title>Profile mockups</title><style>
body{font:15px/1.6 -apple-system,system-ui,sans-serif;background:#f5f5f3;color:#222;max-width:720px;margin:2rem auto;padding:0 1rem}
.c{background:#fff;border:1px solid #e3e3e0;border-radius:12px;padding:1rem 1.25rem;margin:0 0 12px}
.l{font-size:12px;color:#888;margin:0 0 6px}h2{font-size:16px;margin:1.5rem 0 8px}
.mono{font:13px ui-monospace,Menlo,monospace}.pill{font-size:12px;padding:4px 12px;border-radius:99px;border:1px solid #bbb}
.m{display:flex;align-items:center;gap:10px;margin:0 0 6px}.g{display:grid;grid-template-columns:1fr 1fr;gap:12px}.s{background:#f5f5f3;border-radius:8px;padding:12px 14px}
@keyframes bump{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.45)}}</style>
<h2>1. Waveform styles</h2>
<div class=c><p class=l>A. Mirrored bars</p>${bars(70,'#378ADD')}</div>
<div class=c><p class=l>B. Smooth filled wave</p>${wave()}</div>
<div class=c><p class=l>C. Live equalizer (animated)</p>${bars(70,'#1D9E75',1)}</div>
<h2>2. Full page (mirrored bars)</h2>
<div class=c style="padding:1.5rem 1.25rem">
<p style="font-size:22px;font-weight:500;margin:0;text-align:center">hey, i'm sid</p>
<p style="color:#666;margin:4px 0 14px;text-align:center">i write code, mostly with headphones on</p>
${bars(60,'#378ADD')}
<p class=mono style="font-size:11px;color:#999;text-align:center;margin:4px 0 16px">52 weeks of commits, as sound</p>
<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:0 0 20px">${pills}</div>
<div class=g><div class=s><p class=mono style="margin:0 0 8px;color:#999">SIDE A · code</p><p class=mono style="margin:0 0 4px">01 building: [current project]</p><p class=mono style="margin:0 0 4px">02 using: Java, TS, React, Postgres</p><p class=mono style="margin:0">03 learning: [thing]</p></div>
<div class=s><p class=mono style="margin:0 0 8px;color:#999">SIDE B · music</p><p class=mono style="margin:0 0 4px">04 on repeat: [song / artist]</p><p class=mono style="margin:0 0 4px">05 fun fact: music changes everything</p><p class=mono style="margin:0">06 say hi: links above</p></div></div>
<p class=mono style="margin:18px 0 8px;color:#999">MIXER · top languages</p><div class=s>${mix}</div></div>`);
