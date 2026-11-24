// probe.mjs — layout probe: every object visible, one camera per second. node src/probe.mjs '[[ [X,Y], k ], …]'
import fs from "node:fs";
import { camAt, kitCss, runtimeJs } from "../../../kit/iso.mjs";
import { world } from "./world.mjs";
const cams = JSON.parse(process.argv[2] || "[]");
const html = `<template><style>${kitCss()} #root{position:absolute;inset:0;overflow:hidden;background:#efebe3}</style>
<div id="root" data-composition-id="story" data-width="1920" data-height="1080"><div class="k-stage"><div id="cam" data-layout-allow-overflow data-layout-ignore>${world()}</div></div></div>
<script>${runtimeJs()}
(function(){const tl=gsap.timeline({paused:true});const C=${JSON.stringify(cams.map((c) => camAt(c[0], c[2] ?? 960, c[3] ?? 540, c[1])))};
["lbk","vgold","dgold","egold","don0","don1","don2","tok"].forEach(function(id){tl.set("#"+id,{opacity:1},0);});
C.forEach((c,i)=>tl.set("#cam",{x:c.x,y:c.y,scale:c.scale},i+0.01));tl.set({}, {}, 117.62);window.__timelines["story"]=tl;})();</script></template>`;
fs.writeFileSync(new URL("../compositions/story.html", import.meta.url), html);
console.log("probe ok");
