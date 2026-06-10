import { useState } from "react";
import { C } from "../data/constants";
import { cd } from "../data/helpers";
import { SYMPTOMS } from "../data/data";

import headacheIcon from "../assets/icons/headache.png";
import stomachIcon  from "../assets/icons/stomachache.png";
import feverIcon    from "../assets/icons/sick.png";
import coldIcon     from "../assets/icons/sneezing.png";
import foodIcon     from "../assets/icons/apple.png";
import woundIcon    from "../assets/icons/wound-care.png";

const SYMPTOM_ICONS = {
  headache: headacheIcon,
  stomach:  stomachIcon,
  fever:    feverIcon,
  cold:     coldIcon,
  food:     foodIcon,
  trauma:   woundIcon,
};

export default function SymptomsScreen({ t, fs, lang, darkMode }) {
  const s = t.symptoms;
  const [sel, setSel] = useState(null);

  const symptoms = SYMPTOMS[lang] || SYMPTOMS.en;

  const bg   = darkMode ? "#0F172A" : "transparent";
  const card = darkMode ? "rgba(30,41,59,.9)" : C.card;
  const text = darkMode ? "#F1F5F9" : C.text;
  const sub  = darkMode ? "#94A3B8" : C.sub;
  const bord = darkMode ? "rgba(255,255,255,.1)" : C.border;

  // ── Symptom Detail View ────────────────────────────────────────────────────
  if (sel) {
    const sym = symptoms.find(x => x.id === sel);
    const iconSrc = SYMPTOM_ICONS[sym.id];

    return (
      <div style={{ padding:16, background:bg, minHeight:"100%" }} className="fi">

        {/* Back */}
        <button
          onClick={() => setSel(null)}
          style={{ background:"none", border:"none", color:C.p, fontWeight:700, fontSize:fs*14, cursor:"pointer", marginBottom:14, padding:0, display:"flex", alignItems:"center", gap:4 }}
        >
          ← {s.back}
        </button>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
          <div style={{ width:60, height:60, borderRadius:16, background:sym.color+"22", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {iconSrc
              ? <img src={iconSrc} width={36} height={36} style={{ objectFit:"contain" }}/>
              : <span style={{ fontSize:28 }}>{sym.icon}</span>
            }
          </div>
          <div style={{ fontSize:fs*20, fontWeight:800, color:text, lineHeight:1.2 }}>{sym.title}</div>
        </div>

        {/* Disclaimer */}
        <div style={{ background: darkMode ? "rgba(245,158,11,.15)" : "#FFFBEB", borderRadius:12, padding:"10px 13px", marginBottom:14, fontSize:fs*12, color: darkMode ? "#FCD34D" : "#92400E", border:`1px solid ${darkMode ? "rgba(245,158,11,.3)" : "#FDE68A"}`, lineHeight:1.55 }}>
          {s.disc}
        </div>

        {/* About */}
        <div style={{ background:card, backdropFilter:"blur(20px)", border:`1px solid ${bord}`, borderRadius:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", padding:14, marginBottom:12 }}>
          <div style={{ fontSize:fs*11, fontWeight:700, color:sub, marginBottom:6, textTransform:"uppercase", letterSpacing:.6 }}>About</div>
          <div style={{ fontSize:fs*13.5, color:text, lineHeight:1.65 }}>{sym.explanation}</div>
        </div>

        {/* What to do */}
        <div style={{ background:card, backdropFilter:"blur(20px)", border:`1px solid ${bord}`, borderRadius:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", padding:14, marginBottom:12 }}>
          <div style={{ fontSize:fs*11, fontWeight:700, color:sub, marginBottom:10, textTransform:"uppercase", letterSpacing:.6 }}>{s.precTitle}</div>
          {sym.prec.map((p, i) => (
            <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
              <div style={{ width:22, height:22, borderRadius:7, background: darkMode ? "rgba(16,185,129,.2)" : C.mintLight || "#D1FAE5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                <span style={{ color:C.green, fontWeight:800, fontSize:12 }}>✓</span>
              </div>
              <span style={{ fontSize:fs*13, color:text, lineHeight:1.55 }}>{p}</span>
            </div>
          ))}
        </div>

        {/* OTC Medicines */}
        <div style={{ background:card, backdropFilter:"blur(20px)", border:`1px solid ${bord}`, borderRadius:16, boxShadow:"0 2px 10px rgba(0,0,0,.06)", padding:14, marginBottom:12 }}>
          <div style={{ fontSize:fs*11, fontWeight:700, color:sub, marginBottom:8, textTransform:"uppercase", letterSpacing:.6 }}>{s.otcTitle}</div>
          <div style={{ background: darkMode ? "rgba(14,165,233,.12)" : C.pXL, borderRadius:8, padding:"8px 11px", marginBottom:10, fontSize:fs*11, color: darkMode ? "#7DD3FC" : C.text, border:`1px solid ${bord}`, lineHeight:1.5 }}>
            {s.otcDisc}
          </div>
          {sym.otc.map((o, i) => (
            <div key={i} style={{ background: darkMode ? "rgba(255,255,255,.04)" : "#F8FBFF", borderRadius:11, padding:"11px 13px", marginBottom:8, border:`1px solid ${bord}` }}>
              <div style={{ fontSize:fs*13, fontWeight:700, color:text, marginBottom:3 }}>{o.name}</div>
              <div style={{ fontSize:fs*12, color:sub, marginBottom:6, lineHeight:1.4 }}>{o.ex}</div>
              <div style={{ fontSize:fs*11, color:"#92400E", background: darkMode ? "rgba(245,158,11,.15)" : "#FEF3C7", borderRadius:7, padding:"4px 9px", border:`1px solid ${darkMode ? "rgba(245,158,11,.3)" : "#FDE68A"}` }}>
                ⚠️ {o.warn}
              </div>
            </div>
          ))}
        </div>

        {/* Red flags */}
        <div style={{ background: darkMode ? "rgba(251,113,133,.12)" : C.rBg, borderRadius:15, padding:"13px 15px", border:`1.5px solid ${darkMode ? "rgba(251,113,133,.3)" : "#FECACA"}`, marginBottom:20 }}>
          <div style={{ fontSize:fs*13, fontWeight:800, color:C.red, marginBottom:10 }}>{s.warnTitle}</div>
          {sym.warns.map((w, i) => (
            <div key={i} style={{ display:"flex", gap:8, marginBottom:6, alignItems:"flex-start" }}>
              <span style={{ color:C.red, fontSize:13, minWidth:14, marginTop:2 }}>•</span>
              <span style={{ fontSize:fs*13, color: darkMode ? "#FCA5A5" : "#7F1D1D", lineHeight:1.45 }}>{w}</span>
            </div>
          ))}
          <button
            onClick={() => window.open("tel:119")}
            style={{ background:C.red, color:"#fff", border:"none", borderRadius:12, padding:"13px", textAlign:"center", fontSize:fs*14, fontWeight:800, cursor:"pointer", width:"100%", marginTop:12, boxShadow:`0 4px 14px ${C.red}55` }}
          >
            🚨 Call 119 for emergencies
          </button>
        </div>

      </div>
    );
  }

  // ── Symptom List ───────────────────────────────────────────────────────────
  return (
    <div style={{ padding:16, background:bg, minHeight:"100%" }} className="fi">

      <div style={{ fontSize:fs*18, fontWeight:800, color:text, marginBottom:3 }}>{s.title}</div>
      <div style={{ fontSize:fs*13, color:sub, marginBottom:13 }}>{s.sub}</div>

      {/* Disclaimer */}
      <div style={{ background: darkMode ? "rgba(245,158,11,.15)" : "#FFFBEB", borderRadius:12, padding:"10px 13px", marginBottom:16, fontSize:fs*12, color: darkMode ? "#FCD34D" : "#92400E", lineHeight:1.55, border:`1px solid ${darkMode ? "rgba(245,158,11,.3)" : "#FDE68A"}` }}>
        {s.disc}
      </div>

      {/* Symptom cards */}
      {symptoms.map(sym => {
        const iconSrc = SYMPTOM_ICONS[sym.id];
        return (
          <button
            key={sym.id}
            onClick={() => setSel(sym.id)}
            style={{ width:"100%", background:card, border:`1.5px solid ${bord}`, borderRadius:16, padding:"14px 16px", marginBottom:10, cursor:"pointer", display:"flex", alignItems:"center", gap:13, textAlign:"left", boxShadow:"0 2px 8px rgba(0,0,0,.06)", transition:"transform .15s ease, box-shadow .15s ease" }}
          >
            {/* Icon box */}
            <div style={{ width:54, height:54, borderRadius:14, background:sym.color+"22", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {iconSrc
                ? <img src={iconSrc} width={32} height={32} style={{ objectFit:"contain" }}/>
                : <span style={{ fontSize:26 }}>{sym.icon}</span>
              }
            </div>

            {/* Text */}
            <div style={{ flex:1 }}>
              <div style={{ fontSize:fs*15, fontWeight:700, color:text, marginBottom:3 }}>{sym.title}</div>
              <div style={{ fontSize:fs*12, color:sub, lineHeight:1.4, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                {sym.explanation.slice(0, 85)}…
              </div>
            </div>

            {/* Arrow */}
            <div style={{ color:C.p, fontSize:20, flexShrink:0 }}>›</div>
          </button>
        );
      })}

    </div>
  );
}