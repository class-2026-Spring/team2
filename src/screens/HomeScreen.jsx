import { C } from "../data/constants";

export default function HomeScreen({ t, fs, setTab }) {
  const s = t.home;

  return (
    <div style={{ padding:"16px 16px 8px" }} className="fi">

      {/* ── Hero Banner ── */}
      <div style={{ background:`linear-gradient(135deg,${C.pD} 0%,${C.p} 55%,#06B6D4 100%)`, borderRadius:22, padding:"22px 20px 20px", marginBottom:16, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-24, right:-20, width:110, height:110, background:"rgba(255,255,255,.07)", borderRadius:"50%" }}/>
        <div style={{ position:"absolute", bottom:-32, right:18, width:78, height:78, background:"rgba(255,255,255,.05)", borderRadius:"50%" }}/>
        <div style={{ fontSize:fs*12.5, color:"rgba(255,255,255,.78)", fontWeight:500, marginBottom:3 }}>{s.sub}</div>
        <div style={{ fontSize:fs*21, color:"#fff", fontWeight:800, lineHeight:1.2, marginBottom:16 }}>{s.hi}</div>
        <div style={{ fontSize:fs*12, color:"rgba(255,255,255,.72)", marginBottom:8, fontWeight:500 }}>{s.urgent}</div>
        <button
          onClick={() => window.open("tel:119")}
          style={{ background:"#fff", color:C.red, border:"none", borderRadius:13, padding:"12px 20px", fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:fs*16, cursor:"pointer", boxShadow:"0 4px 16px rgba(220,38,38,.32)", display:"inline-flex", alignItems:"center", gap:6 }}
        >
          {s.call}
        </button>
      </div>

      {/* ── Quick Access Cards ── */}
      <div style={{ fontSize:fs*14, fontWeight:700, color:C.text, marginBottom:10 }}>{s.quick}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11, marginBottom:16 }}>
        {s.cards.map((c, i) => (
          <button
            key={i}
            onClick={() => setTab(c.tab)}
            style={{ background:C.card, border:`1.5px solid ${C.border}`, borderRadius:16, padding:"15px 14px", cursor:"pointer", textAlign:"left", boxShadow:"0 2px 10px rgba(8,145,178,.07)" }}
          >
            <div style={{ fontSize:27, marginBottom:8 }}>{c.icon}</div>
            <div style={{ fontSize:fs*13, fontWeight:700, color:C.text, marginBottom:3, lineHeight:1.25 }}>{c.t}</div>
            <div style={{ fontSize:fs*11, color:C.sub, lineHeight:1.35 }}>{c.d}</div>
          </button>
        ))}
      </div>

      

      {/* ── Tip Banner ── */}
      <div style={{ background:C.pXL, borderRadius:13, padding:"11px 14px", border:`1px solid ${C.border}`, fontSize:fs*12, color:C.text, lineHeight:1.55, marginBottom:8 }}>
        {s.tip}
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign:"center", fontSize:fs*10.5, color:C.sub, marginTop:6, padding:"0 4px", lineHeight:1.5 }}>
        🎓 University project · Not for clinical use · In emergencies, call 119
      </div>

    </div>
  );
}