(() => {
 const image=document.querySelector('.hero-visual .island');
 const host=document.querySelector('.hero-visual');
 if(!image||!host)return;
 const canvas=document.createElement('canvas');
 canvas.className='living-island';canvas.setAttribute('aria-hidden','true');
 host.insertBefore(canvas,image.nextSibling);
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});
 if(!gl){canvas.remove();return;}
 const vertex=`attribute vec2 p;varying vec2 uv;void main(){uv=vec2((p.x+1.)*.5,(1.-p.y)*.5);gl_Position=vec4(p,0.,1.);}`;
 const fragment=`precision highp float;
 varying vec2 uv;uniform sampler2D scene;uniform float time;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
 float fall(vec2 p,float x,float top,float bottom,float width,float lean){
 float y=clamp((p.y-top)/(bottom-top),0.,1.);
 float center=x+lean*y;
 return (1.-smoothstep(width*.42,width,abs(p.x-center)))*smoothstep(top,top+.025,p.y)*(1.-smoothstep(bottom-.045,bottom,p.y));}
 vec3 lamp(vec2 p,vec2 center,float phase){
 vec2 q=(p-center)*vec2(1.5,1.);
 float flicker=.68+.13*sin(time*.93+phase)+.08*sin(time*1.63+phase*2.);
 float halo=exp(-dot(q,q)/.000115)*.22;
 float core=exp(-dot(q,q)/.000005)*.52;
 return vec3(1.,.57,.13)*(halo+core)*flicker;}
 void main(){
 vec2 q=uv;
 float water=fall(uv,.526,.616,.944,.023,-.014)
  +fall(uv,.800,.541,.794,.020,-.025)
  +fall(uv,.196,.442,.579,.011,-.006)
  +fall(uv,.398,.430,.526,.012,.010);
 water=clamp(water,0.,1.);
 float flow=noise(vec2(uv.x*310.,uv.y*82.-time*1.8));
 // Water moves inside the falls; land and architecture stay steady.
 q.x+=water*(flow-.5)*.004;
 q.y+=water*(noise(vec2(uv.x*185.,uv.y*120.-time*2.8))-.5)*.009;
 vec4 col=texture2D(scene,q);
 float foliage=smoothstep(.012,.085,col.g-max(col.r*.9,col.b))*(1.-smoothstep(.40,.68,uv.y));
 col.rgb=mix(col.rgb,col.rgb*vec3(.83,1.20,.85),foliage*.45);
 float waterGlint=water*(.04+.11*pow(flow,3.));
 col.rgb+=vec3(.75,.94,1.)*waterGlint;
 col.rgb+=lamp(uv,vec2(.470,.311),.3)+lamp(uv,vec2(.555,.371),1.6)
  +lamp(uv,vec2(.641,.280),3.1)+lamp(uv,vec2(.780,.426),4.2)
  +lamp(uv,vec2(.557,.224),2.1)+lamp(uv,vec2(.576,.175),5.1);
 // Fine spray drifts at the feet of the two main waterfalls.
 float mistA=exp(-dot((uv-vec2(.516,.842))*vec2(1.3,1.),(uv-vec2(.516,.842))*vec2(1.3,1.))/.0021);
 float mistB=exp(-dot(uv-vec2(.765,.731),uv-vec2(.765,.731))/.0013);
 float mist=noise(vec2(uv.x*21.+time*.095,uv.y*27.-time*.14));
 col.rgb=mix(col.rgb,vec3(1.),clamp((mistA+mistB)*mist*.22,0.,.3));
 // Fade the surrounding sky toward the white storefront, not the island.
 vec2 edge=(uv-vec2(.50,.48))/vec2(.51,.57);
 float alpha=1.-smoothstep(.66,1.04,length(edge));
 gl_FragColor=vec4(clamp(col.rgb,0.,1.),alpha);
 }`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Island shader unavailable');return s;}
 let program;
 try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Link');}
 catch(e){canvas.remove();return;}
 gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const position=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.uniform1i(gl.getUniformLocation(program,'scene'),0);
 const time=gl.getUniformLocation(program,'time');
 let ready=false,inView=true,frame=0,last=0,elapsed=0;
 const paused=()=>document.hidden||!inView||document.documentElement.classList.contains('paused');
 function draw(){if(!ready)return;gl.uniform1f(time,elapsed*.001);gl.drawArrays(gl.TRIANGLES,0,6);}
 function resize(){const rect=canvas.getBoundingClientRect();const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(rect.width*ratio));canvas.height=Math.max(1,Math.round(rect.height*ratio));gl.viewport(0,0,canvas.width,canvas.height);draw();}
 function tick(now){frame=0;if(paused()||!ready){last=0;return}if(last)elapsed+=Math.min(now-last,60);last=now;draw();frame=requestAnimationFrame(tick);}
 function sync(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;if(!paused()&&ready)frame=requestAnimationFrame(tick);}
 function start(){if(ready)return;try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);ready=true;resize();host.classList.add('island-ready');sync();}catch(e){canvas.remove();}}
 if(image.complete&&image.naturalWidth)start();else image.addEventListener('load',start,{once:true});
 new ResizeObserver(resize).observe(host);
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync()},{rootMargin:'80px'}).observe(host);
 document.getElementById('motionToggle')?.addEventListener('click',sync);
 document.addEventListener('visibilitychange',sync);
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;host.classList.remove('island-ready');if(frame)cancelAnimationFrame(frame);});
})();

// A restrained, live meadow edge; the middle of the storefront stays white.
(() => {
 const host=document.getElementById('storefront');if(!host)return;
 const canvas=document.createElement('canvas');canvas.className='shop-meadow';canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
 const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return;}
 let width=innerWidth,height=160,frame=0,last=0,elapsed=0;
 const seed=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
 function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);ctx.setTransform(d,0,0,d,0,0);draw()}
 function draw(){
  ctx.clearRect(0,0,width,height);
  const edge=Math.min(width*.19,240);
  for(let side=0;side<2;side++){
   const wash=ctx.createRadialGradient(side?width:0,height,0,side?width:0,height,edge);
   wash.addColorStop(0,'rgba(67,112,42,0.13)');wash.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=wash;ctx.fillRect(0,0,width,height);
   for(let i=0;i<95;i++){
    const pos=seed(i+side*101)*edge;
    const x=side?width-pos:pos;
    const fade=1-pos/edge;
    const length=(25+seed(i+71)*100)*fade*(height/160);
    const sway=Math.sin(elapsed*.00055+i*.31)*5;
    const lean=(seed(i+38)-.5)*26+sway;
    const thickness=1.5+seed(i+54)*3;
    const g=ctx.createLinearGradient(x,height,x,height-length);
    g.addColorStop(0,`rgba(42,88,33,${.22+fade*.2})`);g.addColorStop(1,`rgba(91,143,57,${.36+fade*.25})`);
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x,height);
    ctx.bezierCurveTo(x+lean*.22,height-length*.4,x+lean*.65,height-length*.83,x+lean,height-length);
    ctx.bezierCurveTo(x+lean*.6+thickness,height-length*.56,x+thickness,height-length*.2,x+thickness,height);ctx.fill();
   }
  }
 }
 const paused=()=>document.hidden||document.documentElement.classList.contains('paused');
 function tick(t){frame=0;if(paused()){last=0;return}if(last)elapsed+=Math.min(t-last,60);last=t;draw();frame=requestAnimationFrame(tick)}
 function sync(){if(frame)cancelAnimationFrame(frame);frame=0;last=0;if(!paused())frame=requestAnimationFrame(tick)}
 window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',sync);document.getElementById('motionToggle')?.addEventListener('click',sync);
 new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['class']});resize();sync();
})();
