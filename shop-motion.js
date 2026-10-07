(() => {
 const svg=document.getElementById('goldContours');
 const toggle=document.getElementById('motionToggle');
 if(!svg)return;
 const NS='http://www.w3.org/2000/svg';
 const paths=[];
 for(let side=0;side<2;side++){
  for(let i=0;i<8;i++){
   const path=document.createElementNS(NS,'path');
   path.setAttribute('stroke',i===3?'#b98b2f':'#d2b675');
   path.setAttribute('stroke-width',i===3?'1.35':'0.8');
   path.setAttribute('opacity',i===3?'0.56':String(.18+i*.035));
   svg.appendChild(path);paths.push({path,side,i});
  }
 }
 let width=innerWidth,height=innerHeight,frame=0,elapsed=0,last=0;
 function draw(){
  const t=elapsed/1000;
  const spread=Math.min(15,width/75);
  const sway=Math.min(65,width*.045);
  for(const {path,side,i} of paths){
   const baseline=18+i*spread;
   const phase=t*.17+i*.08+side*1.6;
   const x=(value)=> (side?width-value:value).toFixed(2);
   const a=baseline+Math.sin(phase)*sway;
   const b=baseline+Math.sin(phase+1.4)*sway;
   const c=baseline+Math.sin(phase+2.7)*sway;
   // Widely spaced cubic curves stay smooth at any zoom or display density.
   path.setAttribute('d',`M ${x(a)} -60 C ${x(a+sway)} ${height*.12} ${x(b-sway)} ${height*.21} ${x(b)} ${height*.38} S ${x(c+sway)} ${height*.68} ${x(c)} ${height*.82} S ${x(a-sway)} ${height*1.05} ${x(a)} ${height+60}`);
  }
 }
 function resize(){width=innerWidth;height=innerHeight;svg.setAttribute('viewBox',`0 0 ${width} ${height}`);draw()}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const isPaused=()=>document.documentElement.classList.contains('paused')||document.hidden;
 function tick(now){
  frame=0;if(isPaused()){last=0;return}
  if(last)elapsed+=Math.min(now-last,50);
  last=now;draw();frame=requestAnimationFrame(tick);
 }
 function sync(){
  if(frame)cancelAnimationFrame(frame);
  frame=0;last=0;
  if(!isPaused())frame=requestAnimationFrame(tick);
 }
 toggle.addEventListener('click',sync);
 document.addEventListener('visibilitychange',sync);
 reduced.addEventListener('change',e=>{
  if(e.matches){document.documentElement.classList.add('paused');toggle.textContent='▷ Resume motion';toggle.setAttribute('aria-pressed','true')}
  sync();
 });
 window.addEventListener('resize',resize,{passive:true});
 resize();sync();
})();
