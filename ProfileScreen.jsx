import { useState } from "react";
import { C } from "../data/constants";
import { buildKo, cd, bt } from "../data/helpers";

export default function ProfileScreen({ t, fs, profile, setProfile, saved, setSaved }) {
  const s = t.profile;
  const [editing, setEditing] = useState(!saved);
  const [form, setForm]       = useState({ ...profile });
  const [showQR, setShowQR]   = useState(false);

  const save = () => { setProfile(form); setSaved(true); setEditing(false); };
  const initials = (form.name || "?").split(" ").map(n => n[0] || "").join("").toUpperCase().slice(0,2) || "?";
  const koText = buildKo(form);
  const qrUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=210x210&color=0C4A6E&bgcolor=CFFAFE&data=${encodeURIComponent(koText)}`;

  if (!saved || editing) {
    const textFields = ["name","nat","lang","allergy","disease","meds","contact"];
    return (
      <div style={{ padding:16 }} className="fi">
        <div style={{ fontSize:fs*18, fontWeight:800, color:C.text, marginBottom:4 }}>{s.title}</div>
        <div style={{ fontSize:fs*12, color:C.sub, marginBottom:18 }}>Fill in your details to generate a QR code for medical staff in Korea.</div>
        {textFields.map(k => (
          <div key={k} style={{ marginBottom:12 }}>
            <label style={{ fontSize:fs*12, fontWeight:600, color:C.text, display:"block", marginBottom:4 }}>{s.labels[k]}</label>
            <input type="text" value={form[k] || ""} onChange={e => setForm({...form,[k]:e.target.value})} placeholder={s.ph[k]}
              style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:fs*14, color:C.text, background:"#F8FBFF" }}/>
          </div>
        ))}
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:fs*12, fontWeight:600, color:C.text, display:"block", marginBottom:4 }}>{s.labels.blood}</label>
          <select value={form.blood || "Unknown"} onChange={e => setForm({...form,blood:e.target.value})}
            style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:fs*14, color:C.text, background:"#F8FBFF" }}>
            {s.bOpts.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <button onClick={save} style={{ ...bt(C.p), fontSize:fs*15, borderRadius:14, padding:"14px", marginBottom:8 }}>{s.saveBtn}</button>
        {saved && <button onClick={() => setEditing(false)} style={{ ...bt("transparent", C.sub, { border:`1.5px solid ${C.border}` }), fontSize:fs*13 }}>Cancel</button>}
      </div>
    );
  }

  return (
    <div className="fi">
      <div style={{ background:`linear-gradient(135deg,${C.pD},${C.p},#06B6D4)`, height:108, position:"relative", flexShrink:0 }}>
        <div style={{ position:"absolute", bottom:-36, left:"50%", transform:"translateX(-50%)", width:72, height:72, borderRadius:"50%", background:`linear-gradient(135deg,${C.pD},${C.p})`, border:"3.5px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:fs*24, fontWeight:800, color:"#fff", boxShadow:"0 4px 16px rgba(8,145,178,.35)" }}>
          {initials}
        </div>
      </div>
      <div style={{ paddingTop:44, textAlign:"center", padding:"44px 16px 0" }}>
        <div style={{ fontSize:fs*21, fontWeight:800, color:C.text, lineHeight:1.1 }}>{form.name || "—"}</div>
        <div style={{ fontSize:fs*13, color:C.sub, marginBottom:3, marginTop:2 }}>{form.nat || "—"}</div>
        <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:C.pXL, border:`1px solid ${C.border}`, borderRadius:8, padding:"3px 10px", fontSize:fs*12, color:C.p, fontWeight:600, marginBottom:14 }}>
          🌐 {form.lang || "—"}
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:18 }}>
          <button onClick={() => setShowQR(true)} style={{ background:C.p, color:"#fff", border:"none", borderRadius:12, padding:"10px 18px", fontWeight:700, fontSize:fs*13, cursor:"pointer", flex:1, maxWidth:210, boxShadow:`0 4px 12px ${C.p}44` }}>{s.qrBtn}</button>
          <button onClick={() => { setForm({...profile}); setEditing(true); }} style={{ background:C.pXL, color:C.p, border:`1.5px solid ${C.border}`, borderRadius:12, padding:"10px 14px", fontWeight:700, fontSize:fs*13, cursor:"pointer", whiteSpace:"nowrap" }}>{s.editBtn}</button>
        </div>
      </div>
      <div style={{ padding:"0 16px 24px" }}>
        <div style={{ fontSize:fs*14, fontWeight:700, color:C.text, marginBottom:10 }}>{s.medInfo}</div>
        {[
          { icon:"🩸", label:s.labels.blood,   val:form.blood   },
          { icon:"⚠️", label:s.labels.allergy, val:form.allergy },
          { icon:"🏥", label:s.labels.disease, val:form.disease },
          { icon:"💊", label:s.labels.meds,    val:form.meds    },
          { icon:"📞", label:s.labels.contact, val:form.contact },
        ].map(({ icon, label, val }, i) => (
          <div key={i} style={{ ...cd({ display:"flex", gap:12, alignItems:"flex-start", marginBottom:10, padding:"12px 14px" }) }}>
            <span style={{ fontSize:20, minWidth:24, marginTop:1 }}>{icon}</span>
            <div>
              <div style={{ fontSize:fs*11, fontWeight:600, color:C.sub, marginBottom:1 }}>{label}</div>
              <div style={{ fontSize:fs*14, fontWeight:500, color:val ? C.text : C.sub, lineHeight:1.4 }}>{val || s.na}</div>
            </div>
          </div>
        ))}
      </div>
      {showQR && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.62)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:20 }} onClick={() => setShowQR(false)}>
          <div style={{ background:C.card, borderRadius:24, padding:24, maxWidth:350, width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,.25)" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:fs*17, fontWeight:800, color:C.text, marginBottom:4 }}>{s.qrTitle}</div>
            <div style={{ fontSize:fs*12, color:C.sub, marginBottom:18, lineHeight:1.5 }}>{s.qrSub}</div>
            <div style={{ background:C.pXL, borderRadius:16, padding:16, display:"inline-block", marginBottom:12, border:`2px solid ${C.pL}` }}>
              <img src={qrUrl} alt="Medical QR Code" style={{ width:210, height:210, display:"block", borderRadius:8 }}/>
            </div>
            <div style={{ background:"#FFFBEB", borderRadius:10, padding:"10px 12px", marginBottom:16, textAlign:"left", fontSize:fs*11, color:"#78350F", lineHeight:1.7, border:"1px solid #FDE68A" }}>
              <div style={{ fontWeight:700, marginBottom:3 }}>📋 {s.koLabel}:</div>
              {koText.split("\n").map((l,i) => <div key={i} style={{ fontFamily:"monospace" }}>{l}</div>)}
            </div>
            <button onClick={() => setShowQR(false)} style={{ ...bt(C.p), borderRadius:12, fontSize:fs*14 }}>{s.close}</button>
          </div>
        </div>
      )}
    </div>
  );
}