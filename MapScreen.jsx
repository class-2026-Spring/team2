import { useState } from "react";
import { C, SC, SL } from "../data/constants";
import { isStale, cd } from "../data/helpers";
import { LOCS } from "../data/data";

const FILTER_KEYS = ["All","Hospitals","Pharmacies","ER Only"];

export default function MapScreen({ t, fs, statuses, lang }) {
  const s = t.map;
  const [filter, setFilter]     = useState("All");
  const [expanded, setExpanded] = useState(null);

  const filtered = LOCS.filter(l => {
    if (filter === "All")        return true;
    if (filter === "Hospitals")  return l.type === "hospital";
    if (filter === "Pharmacies") return l.type === "pharmacy";
    if (filter === "ER Only")    return l.er;
    return true;
  });

  return (
    <div style={{ padding:16 }} className="fi">
      <div style={{ fontSize:fs*18, fontWeight:800, color:C.text, marginBottom:2 }}>{s.title}</div>
      <div style={{ fontSize:fs*12.5, color:C.sub, marginBottom:14 }}>{s.sub}</div>
      <div style={{ display:"flex", gap:7, marginBottom:16, overflowX:"auto", paddingBottom:3 }}>
        {s.filt.map((f,i) => {
          const active = filter === FILTER_KEYS[i];
          return (
            <button key={i} onClick={() => setFilter(FILTER_KEYS[i])} style={{ flexShrink:0, background:active?C.p:C.card, color:active?"#fff":C.sub, border:`1.5px solid ${active?C.p:C.border}`, borderRadius:20, padding:"7px 15px", fontSize:fs*12.5, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>{f}</button>
          );
        })}
      </div>
      {filtered.length === 0 && <div style={{ textAlign:"center", color:C.sub, padding:40, fontSize:fs*14 }}>{s.noR}</div>}
      {filtered.map(loc => {
        const st   = statuses[loc.id];
        const isEx = expanded === loc.id;
        return (
          <div key={loc.id} style={{ ...cd({ marginBottom:11, padding:0, overflow:"hidden" }) }}>
            <div style={{ padding:"14px 15px", cursor:"pointer" }} onClick={() => setExpanded(isEx ? null : loc.id)}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:6 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:5 }}>
                    <span style={{ background:loc.type==="hospital"?C.pL:C.gBg, color:loc.type==="hospital"?C.p:C.gDark, borderRadius:6, padding:"2px 8px", fontSize:fs*10.5, fontWeight:700, textTransform:"uppercase" }}>{loc.type==="hospital"?"🏥 Hospital":"💊 Pharmacy"}</span>
                    {loc.er && <span style={{ background:C.rBg, color:C.red, borderRadius:6, padding:"2px 8px", fontSize:fs*10.5, fontWeight:700 }}>{s.er}</span>}
                    <span style={{ background:loc.open?C.gBg:C.rBg, color:loc.open?C.green:C.red, borderRadius:6, padding:"2px 8px", fontSize:fs*10.5, fontWeight:700 }}>{loc.open?`● ${s.open}`:`○ ${s.closed}`}</span>
                  </div>
                  <div style={{ fontSize:fs*15, fontWeight:700, color:C.text, lineHeight:1.2 }}>{loc.name}</div>
                  <div style={{ fontSize:fs*12, color:C.sub }}>{loc.ko}</div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:fs*12, fontWeight:600, color:C.sub }}>{loc.dist}</div>
                  <div style={{ fontSize:20, color:C.p, marginTop:4 }}>{isEx?"▲":"▼"}</div>
                </div>
              </div>
              {loc.type==="hospital" && st && (
                <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:SC[st.s].bg, borderRadius:8, padding:"4px 11px", border:`1px solid ${SC[st.s].c}33` }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:SC[st.s].c, display:"inline-block" }}/>
                  <span style={{ fontSize:fs*11.5, fontWeight:700, color:SC[st.s].c }}>{SL[st.s][lang]||SL[st.s].en}</span>
                  {isStale(st.upd) && <span style={{ fontSize:fs*10, color:C.sub }}>· {t.hospitals.stale}</span>}
                </div>
              )}
            </div>
            {isEx && (
              <div style={{ padding:"0 15px 14px", borderTop:`1px solid ${C.border}` }}>
                <div style={{ paddingTop:10, display:"grid", gap:7 }}>
                  {[{k:s.hours,v:loc.hours},{k:s.phone,v:loc.phone},{k:s.dist,v:loc.dist+" from city center"}].map(({k,v}) => (
                    <div key={k} style={{ display:"flex", gap:8, fontSize:fs*13 }}>
                      <span style={{ color:C.sub, fontWeight:600, minWidth:72, flexShrink:0 }}>{k}:</span>
                      <span style={{ color:C.text }}>{v}</span>
                    </div>
                  ))}
                  {loc.langs.length > 0 && (
                    <div style={{ display:"flex", gap:8, fontSize:fs*13, flexWrap:"wrap", alignItems:"flex-start" }}>
                      <span style={{ color:C.sub, fontWeight:600, minWidth:72, flexShrink:0 }}>{s.langs}:</span>
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        {loc.langs.map(l => <span key={l} style={{ background:C.pXL, color:C.p, borderRadius:6, padding:"2px 9px", fontSize:fs*11, fontWeight:600, border:`1px solid ${C.border}` }}>{l}</span>)}
                      </div>
                    </div>
                  )}
                  <a href={`https://maps.google.com/?q=${loc.q}`} target="_blank" rel="noreferrer" style={{ display:"block", background:C.pXL, color:C.p, borderRadius:10, padding:"10px", textAlign:"center", fontWeight:700, fontSize:fs*13, textDecoration:"none", marginTop:3, border:`1px solid ${C.border}` }}>{s.dir}</a>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}