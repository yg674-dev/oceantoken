import{t as h,p as b,u as f}from"./Dn5pUiUG.js";const m=["bytedance/seedance-2.0","bytedance/seedance-2.0-upscaled"],p="/media/seedance/",$={full:["compare-native.jpg","compare-upscaled.jpg",1600,900],sign:["crop-sign-native.jpg","crop-sign-upscaled.jpg",480,300],fur:["crop-fur-native.jpg","crop-fur-upscaled.jpg",420,300]};function v(l=b.videoPromo){const e=l.officialPerSecond,t=l.upscaleFactor;return{native:e,upscaled:e*t,saving:Math.round((1-t)*100),resolution:l.resolution}}function y(l,e="en",t=a=>String(a)){if(!l||!m.includes(l.id))return"";const a=h(e),s=v(),u=s.resolution,[o,i,n,c]=$.full,r=(d,g)=>`<button type="button" data-shot="${d}" aria-pressed="${g}">${a("up.shot."+d)}</button>`;return`<section class="upscale-compare" aria-labelledby="uc-title">
<p class="section-label">${a("up.label")}</p>
<h2 id="uc-title">${a("up.title",{saving:s.saving})}</h2>
<p class="uc-lead">${a("up.lead",{res:u})}</p>
<div class="uc-frame" data-shot="full" style="--pos:50%">
<img class="uc-a" src="${p}${o}" alt="${a("up.nativeFrame",{res:u})}" width="${n}" height="${c}" loading="lazy">
<img class="uc-b" src="${p}${i}" alt="${a("up.upscaledFrame",{res:u})}" width="${n}" height="${c}" loading="lazy">
<span class="uc-line" aria-hidden="true"></span>
<span class="uc-label uc-left"><b>${a("up.native",{res:u})}</b>${t(f(s.native))} ${a("up.perSecond")}</span>
<span class="uc-label uc-right"><b>${a("up.upscaled",{res:u})}</b>${t(f(s.upscaled))} ${a("up.perSecond")} · −${s.saving}%</span>
<input class="uc-range" type="range" min="0" max="100" value="50" aria-label="${a("up.range")}">
</div>
<div class="uc-shots" role="group" aria-label="${a("up.shots")}">${r("full",!0)}${r("sign",!1)}${r("fur",!1)}</div>
<ul class="uc-facts"><li><b>−${s.saving}%</b>${a("up.fact.price")}</li><li><b>${a("up.fact.look")}</b>${a("up.fact.lookText")}</li><li><b>${a("up.fact.native")}</b>${a("up.fact.nativeText")}</li></ul>
</section>`}function E(l=document){l.querySelectorAll(".upscale-compare").forEach(e=>{if(e.dataset.mounted)return;e.dataset.mounted="1";const t=e.querySelector(".uc-frame"),a=e.querySelector(".uc-range");a.addEventListener("input",()=>t.style.setProperty("--pos",a.value+"%")),e.querySelectorAll(".uc-shots button").forEach(s=>s.addEventListener("click",()=>{const[u,o,i,n]=$[s.dataset.shot];t.dataset.shot=s.dataset.shot;for(const[c,r]of[[t.querySelector(".uc-a"),u],[t.querySelector(".uc-b"),o]])c.src=p+r,c.width=i,c.height=n;e.querySelectorAll(".uc-shots button").forEach(c=>c.setAttribute("aria-pressed",String(c===s)))}))})}export{v as a,E as m,y as u};
