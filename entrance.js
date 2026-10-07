(() => {
 const entrance=document.getElementById('entrance');
 const storefront=document.getElementById('storefront');
 const trigger=document.getElementById('enterWorld');
 const root=document.documentElement;
 let opening=false;
 // This entrance is intentionally shown on every fresh page visit.
 entrance.hidden=false;
 storefront.inert=true;
 const previousRestoration=history.scrollRestoration;
 history.scrollRestoration='manual';
 window.scrollTo({top:0,behavior:'instant'});
 trigger.focus({preventScroll:true});
 trigger.addEventListener('click',()=>{
  if(opening)return;
  opening=true;
  trigger.disabled=true;
  window.scrollTo({top:0,behavior:'instant'});
  root.classList.add('is-opening');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.setTimeout(()=>{
   entrance.hidden=true;
   root.classList.remove('has-entrance','is-opening');
   storefront.inert=false;
   history.scrollRestoration=previousRestoration;
   const heading=storefront.querySelector('h1');
   heading.setAttribute('tabindex','-1');
   heading.focus({preventScroll:true});
  },reduced?0:1900);
 });
})();
