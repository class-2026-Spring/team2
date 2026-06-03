import { useState, useEffect } from "react";
import { C } from "../data/constants";
import { buildKo, cd, bt } from "../data/helpers";
import { sb } from "../lib/supabase";

export default function ProfileScreen({ t, fs, user, onBack, onSignOut }) {
  const s = t.profile;

  const [form,    setForm]    = useState({ name:"", nat:"", lang:"English", blood:"Unknown", allergy:"", disease:"", meds:"", contact:"" });
  const [editing, setEditing] = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [showQR,  setShowQR]  = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [deleting,setDeleting]= useState(false);
  const [showDel, setShowDel] = useState(false);
  const [msg,     setMsg]     = useState("");

  // ── Load profile from Supabase ─────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await sb
        .from("medical_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setForm({
          name:    data.name    || "",
          nat:     data.nationality || "",
          lang:    data.preferred_language || "English",
          blood:   data.blood_type || "Unknown",
          allergy: data.allergies || "",
          disease: data.conditions || "",
          meds:    data.medications || "",
          contact: data.emergency_contact || "",
        });
        setSaved(true);
      } else {
        setEditing(true);
      }
      setLoading(false);
    };
    if (user) load();
  }, [user]);

  // ── Save profile to Supabase ───────────────────────────────────────────────
  const save = async () => {
    setSaving(true); setMsg("");
    const payload = {
      user_id:            user.id,
      name:               form.name,
      nationality:        form.nat,
      preferred_language: form.lang,
      blood_type:         form.blood,
      allergies:          form.allergy,
      conditions:         form.disease,
      medications:        form.meds,
      emergency_contact:  form.contact,
      updated_at:         new Date().toISOString(),
    };

    const { error } = await sb
      .from("medical_profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      setMsg("❌ Failed to save. Please try again.");
    } else {
      setSaved(true);
      setEditing(false);
      setMsg("✅ Profile saved successfully!");
      setTimeout(() => setMsg(""), 3000);
    }
    setSaving(false);
  };

  // ── Delete profile from Supabase ───────────────────────────────────────────
  const deleteProfile = async () => {
    setDeleting(true);
    const { error } = await sb
      .from("medical_profiles")
      .delete()
      .eq("user_id", user.id);

    if (!error) {
      setForm({ name:"", nat:"", lang:"English", blood:"Unknown", allergy:"", disease:"", meds:"", contact:"" });
      setSaved(false);
      setEditing(true);
      setShowDel(false);
    }
    setDeleting(false);
  };

  const koText = buildKo(form);
  const qrUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=210x210&color=0C4A6E&bgcolor=CFFAFE&data=${encodeURIComponent(koText)}`;
  const initials = form.name
    ? form.name.split(" ").map(n => n[0] || "").join("").toUpperCase().slice(0,2)
    : user?.email?.[0]?.toUpperCase() || "?";

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:300, gap:12, flexDirection:"column" }}>
      <div style={{ width:36, height:36, border:`3px solid ${C.border}`, borderTop:`3px solid ${C.p}`, borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
      <div style={{ fontSize:13, color:C.sub }}>Loading profile…</div>
    </div>
  );

  // ── Edit Form ──────────────────────────────────────────────────────────────
  if (editing) return (
    <div style={{ padding:16 }}>
      {/* Back button */}
      <button onClick={() => saved ? setEditing(false) : onBack()} style={{ background:"none", border:"none", color:C.p, fontWeight:600, fontSize:fs*14, cursor:"pointer", marginBottom:16, padding:0, display:"flex", alignItems:"center", gap:6 }}>
        ← Back
      </button>

      <div style={{ fontSize:fs*18, fontWeight:800, color:C.text, marginBottom:4 }}>{s.title}</div>
      <div style={{ fontSize:fs*12, color:C.sub, marginBottom:6 }}>
        Signed in as <strong>{user?.email}</strong>
      </div>
      <div style={{ fontSize:fs*12, color:C.sub, marginBottom:18 }}>
        Your profile is saved to your account and shown to Korean medical staff via QR code.
      </div>

      {[
        { k:"name",    label:s.labels.name,    ph:s.ph.name    },
        { k:"nat",     label:s.labels.nat,     ph:s.ph.nat     },
        { k:"lang",    label:s.labels.lang,    ph:s.ph.lang    },
        { k:"allergy", label:s.labels.allergy, ph:s.ph.allergy },
        { k:"disease", label:s.labels.disease, ph:s.ph.disease },
        { k:"meds",    label:s.labels.meds,    ph:s.ph.meds    },
        { k:"contact", label:s.labels.contact, ph:s.ph.contact },
      ].map(({ k, label, ph }) => (
        <div key={k} style={{ marginBottom:12 }}>
          <label style={{ fontSize:fs*12, fontWeight:600, color:C.text, display:"block", marginBottom:4 }}>{label}</label>
          <input
            type="text" value={form[k] || ""}
            onChange={e => setForm({ ...form, [k]: e.target.value })}
            placeholder={ph}
            style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:fs*14, color:C.text, background:"#F8FBFF", fontFamily:"'Outfit',sans-serif" }}
          />
        </div>
      ))}

      <div style={{ marginBottom:18 }}>
        <label style={{ fontSize:fs*12, fontWeight:600, color:C.text, display:"block", marginBottom:4 }}>{s.labels.blood}</label>
        <select value={form.blood} onChange={e => setForm({ ...form, blood: e.target.value })}
          style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:fs*14, color:C.text, background:"#F8FBFF", fontFamily:"'Outfit',sans-serif" }}>
          {s.bOpts.map(b => <option key={b}>{b}</option>)}
        </select>
      </div>

      {msg && <div style={{ background: msg.startsWith("✅") ? C.gBg : C.rBg, color: msg.startsWith("✅") ? C.gDark : C.red, borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{msg}</div>}

      <button onClick={save} disabled={saving} style={{ ...bt(C.p), fontSize:fs*15, borderRadius:14, padding:"14px", marginBottom:8, opacity: saving ? .7 : 1 }}>
        {saving ? "Saving…" : s.saveBtn}
      </button>

      {saved && (
        <button onClick={() => setEditing(false)} style={{ ...bt("transparent", C.sub, { border:`1.5px solid ${C.border}` }), fontSize:fs*13 }}>
          Cancel
        </button>
      )}
    </div>
  );

  // ── Profile View ───────────────────────────────────────────────────────────
  return (
    <div className="fi">
      {/* Cover */}
      <div style={{ background:`linear-gradient(135deg,${C.pD},${C.p},#06B6D4)`, height:108, position:"relative", overflow:"hidden", flexShrink:0 }}>
        <div style={{ position:"absolute", top:-24, right:-20, width:110, height:110, background:"rgba(255,255,255,.08)", borderRadius:"50%" }}/>
        <div style={{ position:"absolute", bottom:-36, left:30, width:100, height:100, background:"rgba(255,255,255,.06)", borderRadius:"50%" }}/>
        {/* Back button on cover */}
        <button onClick={onBack} style={{ position:"absolute", top:12, left:12, background:"rgba(255,255,255,.2)", border:"1px solid rgba(255,255,255,.3)", borderRadius:10, padding:"6px 12px", color:"#fff", fontSize:fs*12, fontWeight:600, cursor:"pointer" }}>
          ← Back
        </button>
        {/* Avatar */}
        <div style={{ position:"absolute", bottom:-36, left:"50%", transform:"translateX(-50%)", width:72, height:72, borderRadius:22, background:`linear-gradient(135deg,${C.pD},${C.p})`, border:"3px solid #fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:fs*24, fontWeight:800, color:"#fff", boxShadow:`0 4px 16px ${C.p}55`, fontFamily:"'Outfit',sans-serif" }}>
          {initials}
        </div>
      </div>

      <div style={{ padding:"48px 16px 0", textAlign:"center" }}>
        <div style={{ fontSize:fs*20, fontWeight:800, color:C.text, lineHeight:1.1 }}>{form.name || "—"}</div>
        <div style={{ fontSize:fs*13, color:C.sub, marginTop:2, marginBottom:2 }}>{form.nat || "—"}</div>
        <div style={{ fontSize:fs*11, color:C.sub, marginBottom:4 }}>{user?.email}</div>
        <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:C.pXL, border:`1px solid ${C.border}`, borderRadius:8, padding:"3px 10px", fontSize:fs*12, color:C.p, fontWeight:600, marginBottom:18 }}>
          🌐 {form.lang}
        </div>

        {/* Action buttons */}
        <div style={{ display:"flex", gap:8, marginBottom:6 }}>
          <button onClick={() => setShowQR(true)} style={{ background:C.p, color:"#fff", border:"none", borderRadius:12, padding:"10px 16px", fontWeight:700, fontSize:fs*13, cursor:"pointer", flex:1, boxShadow:`0 4px 12px ${C.p}44`, fontFamily:"'Outfit',sans-serif" }}>
            📱 {s.qrBtn}
          </button>
          <button onClick={() => setEditing(true)} style={{ background:C.pXL, color:C.p, border:`1.5px solid ${C.border}`, borderRadius:12, padding:"10px 14px", fontWeight:700, fontSize:fs*13, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
            ✏️
          </button>
        </div>

        {/* Sign out + Delete */}
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          <button onClick={onSignOut} style={{ flex:1, background:"transparent", color:C.sub, border:`1.5px solid ${C.border}`, borderRadius:12, padding:"9px", fontWeight:600, fontSize:fs*12, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
            🚪 Sign Out
          </button>
          <button onClick={() => setShowDel(true)} style={{ flex:1, background:C.rBg, color:C.red, border:`1.5px solid ${C.red}33`, borderRadius:12, padding:"9px", fontWeight:600, fontSize:fs*12, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
            🗑️ Delete Profile
          </button>
        </div>
      </div>

      {/* Medical info */}
      <div style={{ padding:"0 16px 24px" }}>
        <div style={{ fontSize:fs*13, fontWeight:700, color:C.sub, letterSpacing:.6, textTransform:"uppercase", marginBottom:10 }}>{s.medInfo}</div>
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
              <div style={{ fontSize:fs*11, fontWeight:600, color:C.sub, marginBottom:1, textTransform:"uppercase", letterSpacing:.4 }}>{label}</div>
              <div style={{ fontSize:fs*14, fontWeight:500, color:val ? C.text : C.sub, lineHeight:1.4 }}>{val || s.na}</div>
            </div>
          </div>
        ))}
      </div>

      {/* QR Modal */}
      {showQR && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.62)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:20 }} onClick={() => setShowQR(false)}>
          <div style={{ background:"#fff", borderRadius:24, padding:24, maxWidth:350, width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,.25)" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:fs*17, fontWeight:800, color:C.text, marginBottom:4 }}>{s.qrTitle}</div>
            <div style={{ fontSize:fs*12, color:C.sub, marginBottom:18, lineHeight:1.5 }}>{s.qrSub}</div>
            <div style={{ background:C.pXL, borderRadius:16, padding:16, display:"inline-block", marginBottom:12, border:`2px solid ${C.pL}` }}>
              <img src={qrUrl} alt="Medical QR" style={{ width:210, height:210, display:"block", borderRadius:8 }}/>
            </div>
            <div style={{ background:"#FFFBEB", borderRadius:10, padding:"10px 12px", marginBottom:16, textAlign:"left", fontSize:fs*11, color:"#78350F", lineHeight:1.8, border:"1px solid #FDE68A" }}>
              <div style={{ fontWeight:700, marginBottom:3 }}>📋 {s.koLabel}:</div>
              {koText.split("\n").map((l, i) => <div key={i} style={{ fontFamily:"monospace" }}>{l}</div>)}
            </div>
            <button onClick={() => setShowQR(false)} style={{ ...bt(C.p), borderRadius:12, fontSize:fs*14 }}>{s.close}</button>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDel && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.62)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:20 }} onClick={() => setShowDel(false)}>
          <div style={{ background:"#fff", borderRadius:24, padding:24, maxWidth:340, width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,.25)" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:36, marginBottom:12 }}>🗑️</div>
            <div style={{ fontSize:fs*17, fontWeight:800, color:C.text, marginBottom:8 }}>Delete Medical Profile?</div>
            <div style={{ fontSize:fs*13, color:C.sub, lineHeight:1.6, marginBottom:20 }}>
              This will permanently delete all your medical information from our servers. Your account will remain active.
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowDel(false)} style={{ flex:1, background:C.pXL, color:C.text, border:`1.5px solid ${C.border}`, borderRadius:13, padding:"12px", fontWeight:600, fontSize:fs*14, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
                Cancel
              </button>
              <button onClick={deleteProfile} disabled={deleting} style={{ flex:1, background:C.red, color:"#fff", border:"none", borderRadius:13, padding:"12px", fontWeight:700, fontSize:fs*14, cursor:"pointer", fontFamily:"'Outfit',sans-serif", opacity: deleting ? .7 : 1 }}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}