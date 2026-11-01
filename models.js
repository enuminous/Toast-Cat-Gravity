/* Browser and Node-compatible mathematical kernels. No manuscript code is executed. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ToastModels=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const G=9.81, HOVER=.1016;
  function fall(height,t){const hit=Math.sqrt(2*height/G),time=Math.max(0,Math.min(t,hit));return {height:Math.max(0,height-.5*G*time*time),velocity:t>=hit?0:-G*time,time,hit,landed:t>=hit};}
  function fiction(height,t,spin){return {height:HOVER+(height-HOVER)*Math.exp(-2.5*Math.max(0,t)),angle:360*spin*Math.max(0,t),hover:HOVER};}
  function random(seed){let s=seed>>>0;return()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return(s+.5)/4294967296;};}
  function signal({seed=42,noise=.5,cycles=true,n=500,duration=100}={}){
    const rng=random(seed),series=[];
    for(let i=0;i<n;i++){const t=i*duration/(n-1),normal=Math.sqrt(-2*Math.log(rng()))*Math.cos(2*Math.PI*rng());const planted=cycles?[3.14,6.28,1.57].reduce((sum,p)=>sum+Math.sin(2*Math.PI*t/p),0):0;series.push({t,y:planted+noise*normal});}
    return series;
  }
  function spectrum(series){
    const n=series.length,dt=series[1].t-series[0].t,mean=series.reduce((s,p)=>s+p.y,0)/n,out=[];
    for(let k=1;k<Math.floor(n/2);k++){let re=0,im=0;for(let j=0;j<n;j++){const a=2*Math.PI*k*j/n,v=series[j].y-mean;re+=v*Math.cos(a);im-=v*Math.sin(a);}out.push({frequency:k/(n*dt),period:n*dt/k,amplitude:2*Math.hypot(re,im)/n,bin:k});}
    return out;
  }
  function peaks(spec,count=3){const chosen=[];for(const p of [...spec].sort((a,b)=>b.amplitude-a.amplitude)){if(chosen.every(c=>Math.abs(c.bin-p.bin)>2))chosen.push(p);if(chosen.length===count)break;}return chosen;}
  return{G,HOVER,fall,fiction,random,signal,spectrum,peaks};
});
