import { useState } from "react";
import { C } from "../data/constants";
import { cd } from "../data/helpers";
import { SYMPTOMS } from "../data/data";

export default function SymptomsScreen({ t, fs, lang }) {
  const s = t.symptoms;
  const [sel, setSel] = useState(null);

  // Pick the right language symptom list, fall back to English
  const symptoms = SYMPTOMS[lang] || SYMPTOMS.en;

  if (sel) {
    const sym = symptoms.find(x => x.id === sel);
    return (
      <div style={{ padding:16 }} className="fi">
        <button onClick={() => setSel(null)} style={{ background:"none", border:"none", color:C.p, fontWeight:700, fontSize:fs*14, cursor:"pointer", marginBottom:12, padding:0 }}>
          {s.back}
        </button>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
          <div style={{ width:54, height:54, borderRadius:14, background:sym.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>{sym.icon}</div>
          <div style={{ fontSize:fs*20, fontWeight:800, color:C.text, lineHeight:1.2 }}>{sym.title}</div>
        </div>

        <div style={{ background:"#FFFBEB", borderRadius:12, padding:"10px 13px", marginBottom:14, fontSize:fs*12, color:"#92400E", border:"1px solid #FDE68A", lineHeight:1.55 }}>
          {s.disc}
        </div>

        <div style={{ ...cd({ marginBottom:14 }) }}>
          <div style={{ fontSize:fs*11, fontWeight:700, color:C.sub, marginBottom:6, textTransform:"uppercase", letterSpacing:.6 }}>About</div>
          <div style={{ fontSize:fs*13.5, color:C.text, lineHeight:1.65 }}>{sym.explanation}</div>
        </div>

        <div style={{ ...cd({ marginBottom:14 }) }}>
          <div style={{ fontSize:fs*11, fontWeight:700, color:C.sub, marginBottom:8, textTransform:"uppercase", letterSpacing:.6 }}>{s.precTitle}</div>
          {sym.prec.map((p, i) => (
            <div key={i} style={{ display:"flex", gap:9, marginBottom:7, alignItems:"flex-start" }}>
              <span style={{ color:C.green, fontWeight:800, fontSize:15, minWidth:16, marginTop:1 }}>✓</span>
              <span style={{ fontSize:fs*13, color:C.text, lineHeight:1.5 }}>{p}</span>
            </div>
          ))}
        </div>

        <div style={{ ...cd({ marginBottom:14 }) }}>
          <div style={{ fontSize:fs*11, fontWeight:700, color:C.sub, marginBottom:6, textTransform:"uppercase", letterSpacing:.6 }}>{s.otcTitle}</div>
          <div style={{ background:C.pXL, borderRadius:8, padding:"8px 11px", marginBottom:10, fontSize:fs*11, color:C.text, border:`1px solid ${C.border}`, lineHeight:1.5 }}>
            {s.otcDisc}
          </div>
          {sym.otc.map((o, i) => (
            <div key={i} style={{ background:"#F8FBFF", borderRadius:11, padding:"11px 13px", marginBottom:8, border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:fs*13, fontWeight:700, color:C.text, marginBottom:2 }}>{o.name}</div>
              <div style={{ fontSize:fs*12, color:C.sub, marginBottom:5, lineHeight:1.4 }}>{o.ex}</div>
              <div style={{ fontSize:fs*11, color:"#92400E", background:"#FEF3C7", borderRadius:7, padding:"4px 9px", border:"1px solid #FDE68A" }}>⚠️ {o.warn}</div>
            </div>
          ))}
        </div>

        <div style={{ background:C.rBg, borderRadius:15, padding:"13px 15px", border:`1.5px solid #FECACA`, marginBottom:16 }}>
          <div style={{ fontSize:fs*13, fontWeight:800, color:C.red, marginBottom:8 }}>{s.warnTitle}</div>
          {sym.warns.map((w, i) => (
            <div key={i} style={{ display:"flex", gap:8, marginBottom:5, alignItems:"flex-start" }}>
              <span style={{ color:C.red, fontSize:13, minWidth:14, marginTop:2 }}>•</span>
              <span style={{ fontSize:fs*13, color:"#7F1D1D", lineHeight:1.45 }}>{w}</span>
            </div>
          ))}
          <button onClick={() => window.open("tel:119")} style={{ background:C.red, color:"#fff", border:"none", borderRadius:10, padding:"12px", textAlign:"center", fontSize:fs*14, fontWeight:800, cursor:"pointer", width:"100%", marginTop:10 }}>
            🚨  Call 119 for emergencies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:16 }} className="fi">
      <div style={{ fontSize:fs*18, fontWeight:800, color:C.text, marginBottom:3 }}>{s.title}</div>
      <div style={{ fontSize:fs*13, color:C.sub, marginBottom:13 }}>{s.sub}</div>
      <div style={{ background:"#FFFBEB", borderRadius:12, padding:"10px 13px", marginBottom:16, fontSize:fs*12, color:"#92400E", lineHeight:1.55, border:"1px solid #FDE68A" }}>
        {s.disc}
      </div>
      {symptoms.map(sym => (
        <button key={sym.id} onClick={() => setSel(sym.id)} style={{ width:"100%", background:C.card, border:`1.5px solid ${C.border}`, borderRadius:16, padding:"14px 16px", marginBottom:10, cursor:"pointer", display:"flex", alignItems:"center", gap:13, textAlign:"left", boxShadow:"0 2px 8px rgba(8,145,178,.07)" }}>
          <div style={{ width:52, height:52, borderRadius:13, background:sym.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0 }}>{sym.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:fs*15, fontWeight:700, color:C.text, marginBottom:2 }}>{sym.title}</div>
            <div style={{ fontSize:fs*12, color:C.sub, lineHeight:1.4, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
              {sym.explanation.slice(0, 85)}…
            </div>
          </div>
          <div style={{ color:C.p, fontSize:20, flexShrink:0 }}>›</div>
        </button>
      ))}
    </div>
  );
}