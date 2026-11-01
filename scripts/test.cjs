const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const M=require('../models.js');
const near=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);
// Gravity-only translation: exact initial condition, acceleration, and stop.
near(M.fall(1.22,0).height,1.22);
near(M.fall(1.22,.1).height,1.22-.5*9.81*.01);
near(M.fall(1.22,.1).velocity,-.981);
const hit=Math.sqrt(2*1.22/9.81);
near(M.fall(1.22,hit).height,0);
assert.equal(M.fall(1.22,hit).landed,true);
near(M.fall(1.22,5).height,0);
for(const h of [.3,1.22,3])for(let t=0;t<1;t+=.01){const s=M.fall(h,t);assert.ok(s.height>=0&&s.height<=h);}
// The fictional model is explicitly prescribed and approaches its setpoint.
near(M.fiction(1.22,0,.8).height,1.22);
near(M.fiction(1.22,8,.8).height,M.HOVER,1e-7);
near(M.fiction(1.22,2,.8).angle,576);
assert.ok(M.fiction(1.22,1,.8).height>M.fiction(1.22,2,.8).height);
// The same seed repeats exactly; toggling cycles retains the same noise.
const a=M.signal(),b=M.signal();assert.deepEqual(a,b);
assert.notDeepEqual(a,M.signal({seed:43}));
const pure=M.signal({noise:0}),noise=M.signal({cycles:false});
for(let i=0;i<a.length;i++)near(a[i].y,pure[i].y+noise[i].y);
const peaks=M.peaks(M.spectrum(pure));
for(const p of [1.57,3.14,6.28])assert.ok(peaks.some(x=>Math.abs(x.period-p)<.04),`Missing planted cycle ${p}`);
assert.ok(M.spectrum(M.signal({noise:0,cycles:false})).every(p=>p.amplitude===0));
// Source count, content, provenance, and portable relative assets.
const c={window:{}};vm.runInNewContext(fs.readFileSync('manuscript.js','utf8'),c);
const data=c.window.MANUSCRIPT;assert.equal(data.pages.length,88);assert.equal(data.pages.filter(p=>p.image).length,8);
for(const [i,p]of data.pages.entries()){assert.equal(p.number,i+1);assert.ok(Array.isArray(p.blocks));if(p.image)assert.ok(fs.existsSync(p.image));}
const sha=crypto.createHash('sha256').update(fs.readFileSync('assets/toast-cat-gravity-manuscript.pdf')).digest('hex');assert.equal(sha,data.sourceSHA256);
assert.equal(sha,JSON.parse(fs.readFileSync('source-manifest.json','utf8')).sourceSHA256);
assert.ok(data.pages[76].blocks.some(b=>b.text.includes('pi_cycles')));
const html=fs.readFileSync('index.html','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);
for(const[,id]of fs.readFileSync('app.js','utf8').matchAll(/\$\('#([\w-]+)'\)/g))assert.ok(ids.includes(id),`Missing DOM ID ${id}`);
for(const[,url]of html.matchAll(/(?:src|href)="([^"]+)"/g))if(!/^(https?:|#)/.test(url))assert.ok(fs.existsSync(url),`Missing asset ${url}`);
console.log('PASS: free fall, fictional hover, deterministic signals, DFT recovery, null input, 88 pages, 8 charts, original PDF hash, and application assets.');
