import { useState, useEffect, useRef } from "react";
import { C } from "../data/constants";
import { buildKo, bt } from "../data/helpers";
import { sb } from "../lib/supabase";

import bloodIcon    from "../assets/icons/blood-type.png";
import allergyIcon  from "../assets/icons/allergy.png";
import diseaseIcon  from "../assets/icons/prevent.png";
import medsIcon     from "../assets/icons/medicine.png";
import contactIcon  from "../assets/icons/ambulance.png";

export default function ProfileScreen({ t, fs, user, onBack, onSignOut, darkMode }) {
  const s = t.profile;

  const [form,      setForm]      = useState({ name:"", nat:"", lang:"English", blood:"Unknown", allergy:"", disease:"", meds:"", contact:"" });
  const [editing,   setEditing]   = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [showQR,    setShowQR]    = useState(false);
  const [showDel,   setShowDel]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [msg,       setMsg]       = useState("");
  const [avatar,    setAvatar]    = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // ── Theme ──────────────────────────────────────────────────────────────────
  const bg   = darkMode ? "#0F172A" : C.sky;
  const card = darkMode ? "rgba(30,41,59,.9)" : "rgba(255,255,255,.88)";
  const text = darkMode ? "#F1F5F9" : C.text;
  const sub  = darkMode ? "#94A3B8" : C.sub;
  const bord = darkMode ? "rgba(255,255,255,.12)" : C.border;
  const inp  = darkMode ? "rgba(30,41,59,.8)" : "#F8FBFF";

  // ── Load profile ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data } = await sb
        .from("medical_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setForm({
          name:    data.name                || "",
          nat:     data.nationality         || "",
          lang:    data.preferred_language  || "English",
          blood:   data.blood_type          || "Unknown",
          allergy: data.allergies           || "",
          disease: data.conditions          || "",
          meds:    data.medications         || "",
          contact: data.emergency_contact   || "",
        });
        if (data.avatar_url) setAvatar(data.avatar_url);
        setSaved(true);
      } else {
        setEditing(true);
      }
      setLoading(false);
    })();
  }, [user]);

  // ── Upload avatar ──────────────────────────────────────────────────────────
  const uploadAvatar = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMsg("❌ Image too large. Max 5MB."); return; }
    setUploading(true); setMsg("");

    const ext      = file.name.split(".").pop().toLowerCase();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: upErr } = await sb.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (upErr) { setMsg("❌ Upload failed. Try again."); setUploading(false); return; }

    const { data: urlData } = sb.storage.from("avatars").getPublicUrl(filePath);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    await sb.from("medical_profiles").upsert(
      { user_id: user.id, avatar_url: avatarUrl, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

    setAvatar(avatarUrl);
    setMsg("✅ Photo updated!");
    setTimeout(() => setMsg(""), 3000);
    setUploading(false);
  };

  // ── Save profile ───────────────────────────────────────────────────────────
  const save = async () => {
    setSaving(true); setMsg("");
    const { error } = await sb.from("medical_profiles").upsert({
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
    }, { onConflict: "user_id" });

    if (error) { setMsg("❌ Failed to save. Try again."); }
    else       { setSaved(true); setEditing(false); setMsg("✅ Profile saved!"); setTimeout(() => setMsg(""), 3000); }
    setSaving(false);
  };

  // ── Delete profile ─────────────────────────────────────────────────────────
  const deleteProfile = async () => {
    setDeleting(true);
    await sb.storage.from("avatars").remove([
      `${user.id}/avatar.jpg`,
      `${user.id}/avatar.jpeg`,
      `${user.id}/avatar.png`,
      `${user.id}/avatar.webp`,
    ]);
    const { error } = await sb.from("medical_profiles").delete().eq("user_id", user.id);
    if (!error) {
      setForm({ name:"", nat:"", lang:"English", blood:"Unknown", allergy:"", disease:"", meds:"", contact:"" });
      setAvatar(null); setSaved(false); setEditing(true); setShowDel(false);
    }
    setDeleting(false);
  };

  const koText   = buildKo(form);
  const qrUrl    = `https://api.qrserver.com/v1/create-qr-code/?size=210x210&color=0C4A6E&bgcolor=CFFAFE&data=${encodeURIComponent(koText)}`;
  const initials = form.name
    ? form.name.split(" ").map(n => n[0] || "").join("").toUpperCase().slice(0, 2)
    : (user?.email?.[0] || "?").toUpperCase();

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:320, gap:14, background:bg }}>
      <div style={{ width:38, height:38, border:`3px solid ${bord}`, borderTop:`3px solid ${C.p}`, borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
      <div style={{ fontSize:13, color:sub }}>Loading profile…</div>
    </div>
  );

  // ── EDIT FORM ──────────────────────────────────────────────────────────────
  if (editing) return (
    <div style={{ padding:16, background:bg, minHeight:"100vh" }}>
      <button onClick={() => saved ? setEditing(false) : onBack()} style={{ background:"none", border:"none", color:C.p, fontWeight:600, fontSize:fs*14, cursor:"pointer", marginBottom:16, padding:0, display:"flex", alignItems:"center", gap:4 }}>
        ← Back
      </button>

      <div style={{ fontSize:fs*18, fontWeight:800, color:text, marginBottom:4 }}>{s.title}</div>
      <div style={{ fontSize:fs*12, color:sub, marginBottom:18 }}>
        Signed in as <strong style={{ color:text }}>{user?.email}</strong>
      </div>

      {[
        { k:"name",    label:s.labels.name    },
        { k:"nat",     label:s.labels.nat     },
        { k:"lang",    label:s.labels.lang    },
        { k:"allergy", label:s.labels.allergy },
        { k:"disease", label:s.labels.disease },
        { k:"meds",    label:s.labels.meds    },
        { k:"contact", label:s.labels.contact },
      ].map(({ k, label }) => (
        <div key={k} style={{ marginBottom:12 }}>
          <label style={{ fontSize:fs*12, fontWeight:600, color:sub, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:.4 }}>{label}</label>
          <input
            type="text"
            value={form[k] || ""}
            onChange={e => setForm({ ...form, [k]: e.target.value })}
            placeholder={s.ph[k]}
            style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${bord}`, fontSize:fs*14, color:text, background:inp, fontFamily:"'Outfit',sans-serif" }}
          />
        </div>
      ))}

      <div style={{ marginBottom:18 }}>
        <label style={{ fontSize:fs*12, fontWeight:600, color:sub, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:.4 }}>{s.labels.blood}</label>
        <select
          value={form.blood}
          onChange={e => setForm({ ...form, blood: e.target.value })}
          style={{ width:"100%", padding:"11px 14px", borderRadius:10, border:`1.5px solid ${bord}`, fontSize:fs*14, color:text, background:inp, fontFamily:"'Outfit',sans-serif" }}
        >
          {s.bOpts.map(b => <option key={b}>{b}</option>)}
        </select>
      </div>

      {msg && (
        <div style={{ background: msg.startsWith("✅") ? C.gBg : C.rBg, color: msg.startsWith("✅") ? C.gDark : C.red, borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:14 }}>
          {msg}
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        style={{ ...bt(C.p), fontSize:fs*15, borderRadius:14, padding:"14px", marginBottom:8, opacity: saving ? .7 : 1, boxShadow:`0 6px 20px ${C.p}44` }}
      >
        {saving ? "Saving…" : s.saveBtn}
      </button>
      {saved && (
        <button
          onClick={() => setEditing(false)}
          style={{ ...bt("transparent", sub, { border:`1.5px solid ${bord}` }), fontSize:fs*13 }}
        >
          Cancel
        </button>
      )}
    </div>
  );

  // ── PROFILE VIEW ───────────────────────────────────────────────────────────
  return (
    <div style={{ background:bg, minHeight:"100vh" }} className="fi">

      {/* ── Cover gradient ── */}
      <div style={{
        background:`linear-gradient(135deg,${C.pD},${C.p},#06B6D4)`,
        height:130,
        position:"relative",
        flexShrink:0,
      }}>
        <div style={{ position:"absolute", top:-24, right:-20, width:120, height:120, background:"rgba(255,255,255,.07)", borderRadius:"50%" }}/>
        <div style={{ position:"absolute", bottom:-40, left:30, width:90, height:90, background:"rgba(255,255,255,.05)", borderRadius:"50%" }}/>

        {/* Back button */}
        <button
          onClick={onBack}
          style={{ position:"absolute", top:12, left:12, background:"rgba(255,255,255,.2)", border:"1px solid rgba(255,255,255,.35)", borderRadius:10, padding:"7px 13px", color:"#fff", fontSize:fs*12, fontWeight:600, cursor:"pointer", zIndex:5 }}
        >
          ← Back
        </button>
      </div>

      {/* ── Avatar (outside cover, below it) ── */}
      <div style={{ display:"flex", justifyContent:"center", marginTop:-44, marginBottom:12, position:"relative", zIndex:10 }}>
        <div style={{ position:"relative", display:"inline-block" }}>
          {/* Photo or initials */}
          {avatar ? (
            <img
              src={avatar}
              alt="Profile"
              style={{ width:88, height:88, borderRadius:24, border:"4px solid #fff", objectFit:"cover", display:"block", boxShadow:`0 6px 20px rgba(0,0,0,.2)` }}
            />
          ) : (
            <div style={{
              width:88, height:88, borderRadius:24,
              background:`linear-gradient(135deg,${C.pD},${C.p})`,
              border:"4px solid #fff",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:fs*28, fontWeight:800, color:"#fff",
              boxShadow:`0 6px 20px rgba(0,0,0,.2)`,
              fontFamily:"'Outfit',sans-serif",
            }}>
              {initials}
            </div>
          )}

          {/* 📷 Upload button */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              position:"absolute",
              bottom:-6, right:-6,
              width:32, height:32,
              borderRadius:"50%",
              background: uploading ? C.sub : C.p,
              border:"3px solid #fff",
              display:"flex", alignItems:"center", justifyContent:"center",
              cursor: uploading ? "default" : "pointer",
              fontSize:15,
              zIndex:20,
              boxShadow:`0 3px 10px rgba(0,0,0,.25)`,
              transition:"all .18s ease",
            }}
          >
            {uploading ? "⏳" : "📷"}
          </button>

          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display:"none" }}
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) uploadAvatar(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* ── Name & info ── */}
      <div style={{ textAlign:"center", padding:"0 16px 0" }}>
        <div style={{ fontSize:fs*21, fontWeight:800, color:text, lineHeight:1.1 }}>{form.name || "—"}</div>
        <div style={{ fontSize:fs*13, color:sub, marginTop:3, marginBottom:2 }}>{form.nat || "—"}</div>
        <div style={{ fontSize:fs*11, color:sub, marginBottom:6 }}>{user?.email}</div>
        <div style={{ display:"inline-flex", alignItems:"center", gap:5, background: darkMode ? "rgba(14,165,233,.2)" : C.pXL, border:`1px solid ${bord}`, borderRadius:8, padding:"3px 10px", fontSize:fs*12, color:C.p, fontWeight:600, marginBottom:16 }}>
          🌐 {form.lang}
        </div>

        {/* Status message */}
        {msg && (
          <div style={{ background: msg.startsWith("✅") ? C.gBg : C.rBg, color: msg.startsWith("✅") ? C.gDark : C.red, borderRadius:10, padding:"8px 14px", fontSize:12, marginBottom:12 }}>
            {msg}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display:"flex", gap:8, marginBottom:8 }}>
          <button
            onClick={() => setShowQR(true)}
            style={{ flex:1, background:C.p, color:"#fff", border:"none", borderRadius:12, padding:"11px 16px", fontWeight:700, fontSize:fs*13, cursor:"pointer", boxShadow:`0 4px 12px ${C.p}44`, fontFamily:"'Outfit',sans-serif" }}
          >
            📱 {s.qrBtn}
          </button>
          <button
            onClick={() => setEditing(true)}
            style={{ background: darkMode ? "rgba(14,165,233,.2)" : C.pXL, color:C.p, border:`1.5px solid ${bord}`, borderRadius:12, padding:"11px 16px", fontWeight:700, fontSize:fs*13, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}
          >
            ✏️ Edit
          </button>
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          <button
            onClick={onSignOut}
            style={{ flex:1, background:"transparent", color:sub, border:`1.5px solid ${bord}`, borderRadius:12, padding:"9px", fontWeight:600, fontSize:fs*12, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}
          >
            🚪 Sign Out
          </button>
          <button
            onClick={() => setShowDel(true)}
            style={{ flex:1, background:C.rBg, color:C.red, border:`1.5px solid ${C.red}33`, borderRadius:12, padding:"9px", fontWeight:600, fontSize:fs*12, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* ── Medical info cards ── */}
      <div style={{ padding:"0 16px 32px" }}>
        <div style={{ fontSize:fs*12, fontWeight:700, color:sub, letterSpacing:.8, textTransform:"uppercase", marginBottom:12 }}>{s.medInfo}</div>
        {[
          { icon:bloodIcon, label:s.labels.blood,   val:form.blood   },
          { icon:allergyIcon, label:s.labels.allergy, val:form.allergy },
          { icon:diseaseIcon, label:s.labels.disease, val:form.disease },
          { icon:medsIcon, label:s.labels.meds,    val:form.meds    },
          { icon:contactIcon, label:s.labels.contact, val:form.contact },
        ].map(({ icon, label, val }, i) => (
          <div
            key={i}
            style={{ background:card, backdropFilter:"blur(20px)", border:`1px solid ${bord}`, borderRadius:14, boxShadow:"0 2px 10px rgba(0,0,0,.06)", display:"flex", gap:12, alignItems:"flex-start", marginBottom:10, padding:"13px 14px" }}
          >
            <div style={{ width:36, height:36, borderRadius:10, background: darkMode ? "rgba(14,165,233,.15)" : C.pXL, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <img src={icon} width={22} height={22} style={{ objectFit:"contain" }}/>
</div>
            <div>
              <div style={{ fontSize:fs*11, fontWeight:600, color:sub, marginBottom:2, textTransform:"uppercase", letterSpacing:.4 }}>{label}</div>
              <div style={{ fontSize:fs*14, fontWeight:500, color: val ? text : sub, lineHeight:1.4 }}>{val || s.na}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── QR Modal ── */}
      {showQR && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:20 }} onClick={() => setShowQR(false)}>
          <div style={{ background:"#fff", borderRadius:24, padding:24, maxWidth:350, width:"100%", textAlign:"center", boxShadow:"0 24px 64px rgba(0,0,0,.35)" }} onClick={e => e.stopPropagation()}>
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

      {/* ── Delete Confirm Modal ── */}
      {showDel && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.72)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:20 }} onClick={() => setShowDel(false)}>
          <div style={{ background:"#fff", borderRadius:24, padding:24, maxWidth:340, width:"100%", textAlign:"center", boxShadow:"0 24px 64px rgba(0,0,0,.35)" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:40, marginBottom:12 }}>🗑️</div>
            <div style={{ fontSize:fs*17, fontWeight:800, color:C.text, marginBottom:8 }}>Delete Medical Profile?</div>
            <div style={{ fontSize:fs*13, color:C.sub, lineHeight:1.65, marginBottom:20 }}>
              This will permanently delete all your medical information and profile photo. Your account stays active.
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button
                onClick={() => setShowDel(false)}
                style={{ flex:1, background:C.pXL, color:C.text, border:`1.5px solid ${C.border}`, borderRadius:13, padding:"13px", fontWeight:600, fontSize:fs*14, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={deleteProfile}
                disabled={deleting}
                style={{ flex:1, background:C.red, color:"#fff", border:"none", borderRadius:13, padding:"13px", fontWeight:700, fontSize:fs*14, cursor: deleting ? "default" : "pointer", fontFamily:"'Outfit',sans-serif", opacity: deleting ? .7 : 1 }}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}