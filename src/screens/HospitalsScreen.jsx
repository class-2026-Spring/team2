import { useState } from "react";
import { C, SC, SL, SCYCLE } from "../data/constants";
import { isStale, cd } from "../data/helpers";
import { LOCS } from "../data/data";

export default function HospitalsScreen({ t, fs, statuses, setStatuses, lang }) {
  const s = t.hospitals;
  const [admin, setAdmin] = useState(false);
  const hosps = LOCS.filter(l => l.type === "hospital");

  const cycle = id => {
    const cur  = statuses[id]?.s || "AVAILABLE";
    const next = SCYCLE[(SCYCLE.indexOf(cur)+1) % 3];
    setStatuses({...statuses,[id]:{s:next,upd:"just now"}});
  };

  return (
    <div style={{ padding:16 }} className="fi">
      <div style={{ fontSize:fs*18, fontWeight:800, color:C.text, marginBottom:2 }}>{s.title}</div>
      <div style={{ fontSize:fs*12.5, color:C.sub, marginBottom:14 }}>{s.sub}</div>
      <button onClick={() => setAdmin(!admin)} style={{ width:"100%", background:admin?C.rBg:C.pXL, border:`1.5px solid ${admin?C.red:C.border}`, borderRadius:12, padding:"10px 14px", marginBottom:10, cursor:"pointer", display:"flex", alignItems:"center", gap:8, fontSize:fs*13, fontWeight:600, color:admin?C.red:C.sub }}>
        {admin ? s.adminOff : s.adminOn}
      </button>
      {admin && (
        <div style={{ background:"#FEF2F2", borderRadius:10, padding:"9px 13px", marginBottom:14, fontSize:fs*11.5, color:C.red, border:"1px solid #FECACA", lineHeight:1.55 }}>
          ⚙️  {s.adminNote}
        </div>
      )}
      {hosps.map(h => {
        const st  = statuses[h.id] || { s:"AVAILABLE", upd:"unknown" };
        const cfg = SC[st.s];
        const label = SL[st.s][lang] || SL[st.s].en;
        return (
          <div key={h.id} style={{ ...cd({ marginBottom:14 }) }}>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:fs*15, fontWeight:800, color:C.text, lineHeight:1.2, marginBottom:2 }}>{h.name}</div>
              <div style={{ fontSize:fs*12, color:C.sub, marginBottom:4 }}>{h.ko}</div>
              {h.er && <span style={{ display:"inline-block", background:C.rBg, color:C.red, borderRadius:6, padding:"2px 9px", fontSize:fs*11, fontWeight:700 }}>🚨 Emergency Room Available</span>}
            </div>
            <div onClick={() => admin && cycle(h.id)} style={{ background:cfg.bg, borderRadius:12, padding:"13px 15px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:admin?"pointer":"default", border:`1.5px solid ${cfg.c}33`, marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                <div style={{ width:14, height:14, borderRadius:"50%", background:cfg.c, boxShadow:`0 0 10px ${cfg.c}77`, flexShrink:0 }} className={st.s==="AVAILABLE"?"pulse":""}/>
                <div>
                  <div style={{ fontSize:fs*17, fontWeight:800, color:cfg.c, lineHeight:1.1 }}>{label}</div>
                  <div style={{ fontSize:fs*11, color:C.sub, marginTop:2 }}>
                    {s.lastUp}: {st.upd}
                    {isStale(st.upd) && <span style={{ color:C.amber, marginLeft:4 }}>· ⚠️ {s.stale}</span>}
                  </div>
                </div>
              </div>
              {admin && <span style={{ fontSize:fs*11, color:C.sub, fontWeight:600, flexShrink:0 }}>{s.cycle}</span>}
            </div>
            <div style={{ display:"grid", gap:5 }}>
              {[[h.hours,"🕐"],[h.phone,"📞"],[h.dist+" from city center","📍"]].map(([v,ic]) => (
                <div key={v} style={{ fontSize:fs*12.5, color:C.sub, display:"flex", gap:7, alignItems:"center" }}>
                  <span>{ic}</span><span>{v}</span>
                </div>
              ))}
              {h.langs.length > 0 && (
                <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:2 }}>
                  {h.langs.map(l => <span key={l} style={{ background:C.pXL, color:C.p, borderRadius:6, padding:"2px 9px", fontSize:fs*11, fontWeight:600, border:`1px solid ${C.border}` }}>{l}</span>)}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div style={{ background:C.rBg, borderRadius:15, padding:"16px", textAlign:"center", border:`1.5px solid #FECACA`, marginTop:4 }}>
        <div style={{ fontSize:fs*13, color:C.red, fontWeight:700, marginBottom:8 }}>🚨 For life-threatening emergencies</div>
        <button onClick={() => window.open("tel:119")} style={{ background:C.red, color:"#fff", border:"none", borderRadius:11, padding:"13px 28px", fontWeight:800, fontSize:fs*17, cursor:"pointer", boxShadow:`0 4px 14px ${C.red}44` }}>📞  Call 119</button>
        <div style={{ fontSize:fs*11, color:"#7F1D1D", marginTop:8 }}>Free emergency line · Available 24/7 · Korea</div>
      </div>
    </div>
  );
}