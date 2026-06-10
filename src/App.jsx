import { useState, useEffect } from "react";
import { GS, C } from "./data/constants";
import { T } from "./data/translations";
import { INIT_ST } from "./data/data";
import { sb } from "./lib/supabase";

import AuthScreen            from "./screens/AuthScreen";
import HomeScreen            from "./screens/HomeScreen";
import ProfileScreen         from "./screens/ProfileScreen";
import SymptomsScreen        from "./screens/SymptomsScreen";
import MapScreen             from "./screens/MapScreen";
import HospitalsScreen       from "./screens/HospitalsScreen";
import ChatScreen            from "./screens/ChatScreen";

import homeIcon     from "./assets/icons/house.png";
import profileIcon  from "./assets/icons/profile.png";
import symptomsIcon from "./assets/icons/diagnosis.png";
import findcareIcon from "./assets/icons/find.png";
import aiIcon       from "./assets/icons/assistant.png";

const NAV_ICONS = [homeIcon, symptomsIcon, findcareIcon, aiIcon, profileIcon];


// ── Tab config ────────────────────────────────────────────────────────────────
const TAB_KEYS  = ["home", "symptoms", "map", "chat", "profile"];
const TAB_ICONS = ["🏠", "🩺", "🗺️", "🤖", "🪪"];
const TAB_LABELS = {
  en:["Home","Symptoms","Find Care","AI Chat","Profile"],
  ko:["홈","증상","진료찾기","AI 채팅","프로필"],
  zh:["首页","症状","就医","AI助手","档案"],
  ja:["ホーム","症状","医療","AIチャット","プロフィール"],
};

const EMPTY_PROFILE = { name:"", nat:"", lang:"", blood:"Unknown", allergy:"", disease:"", meds:"", contact:"" };

const outerStyle = (dark) => ({
  width:"100%", minHeight:"100vh",
  display:"flex", justifyContent:"center", alignItems:"flex-start",
  background: dark ? "#0A1628" : "#055F7A",
});

const innerStyle = (dark) => ({
  width:"100%", maxWidth:430, minHeight:"100vh",
  display:"flex", flexDirection:"column",
  background: dark ? "#0F172A" : C.sky,
  fontFamily:"'Outfit',sans-serif",
  position:"relative",
});

export default function App() {
  const [lang,        setLang]        = useState("en");
  const [fontSize,    setFontSize]    = useState("normal");
  const [tab,         setTab]         = useState("home");
  const [statuses,    setStatuses]    = useState(INIT_ST);
  const [showSet,     setShowSet]     = useState(false);
  const [user,        setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tabHistory,  setTabHistory]  = useState(["home"]);
  const [darkMode,    setDarkMode]    = useState(false);

  const t      = T[lang];
  const fs     = fontSize === "large" ? 1.17 : 1;
  const labels = TAB_LABELS[lang] || TAB_LABELS.en;

  // dark mode colours
  const dm = {
    bg:     darkMode ? "#0F172A" : C.sky,
    card:   darkMode ? "rgba(30,41,59,.9)" : "rgba(255,255,255,.95)",
    text:   darkMode ? "#F1F5F9" : C.text,
    sub:    darkMode ? "#94A3B8" : C.sub,
    border: darkMode ? "rgba(255,255,255,.1)" : C.border,
    nav:    darkMode ? "rgba(15,23,42,.97)" : "rgba(255,255,255,.97)",
    header: darkMode ? `linear-gradient(135deg,#0A1628 0%,#1E3A5F 100%)` : `linear-gradient(135deg,${C.pD} 0%,${C.p} 100%)`,
  };

  // ── Session ────────────────────────────────────────────────────────────────
  useEffect(() => {
    sb.auth.getSession().then(({ data:{ session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data:{ subscription } } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const navigate = (newTab) => {
    setTab(newTab);
    setTabHistory(prev => [...prev, newTab]);
  };

  const goBack = () => {
    setTabHistory(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      setTab(next[next.length - 1]);
      return next;
    });
  };

  const signOut = async () => {
    await sb.auth.signOut();
    setUser(null); setTab("home"); setTabHistory(["home"]);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ ...outerStyle(darkMode), alignItems:"center" }}>
      <style>{GS}</style>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
        <div style={{ fontSize:52 }}>🌊</div>
        <div style={{ width:36, height:36, border:"3px solid rgba(255,255,255,.3)", borderTop:"3px solid #fff", borderRadius:"50%", animation:"spin 1s linear infinite" }}/>
      </div>
    </div>
  );

  // ── Auth ───────────────────────────────────────────────────────────────────
  if (!user) return (
    <div style={outerStyle(darkMode)}>
      <style>{GS}</style>
      <div style={{ ...innerStyle(darkMode), background:"transparent" }}>
        <AuthScreen onAuth={(u) => { setUser(u); setTab("home"); }}/>
      </div>
    </div>
  );

  const commonProps = { t, fs, lang, onBack:goBack, darkMode };
  const statusProps = { statuses, lang };

  return (
    <div style={outerStyle(darkMode)}>
      <style>{GS}</style>
      <div style={innerStyle(darkMode)}>

        {/* ── Header ── */}
        <div style={{
          background: dm.header,
          padding:"11px 16px 9px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          flexShrink:0, boxShadow:"0 2px 12px rgba(0,0,0,.2)",
          position:"sticky", top:0, zIndex:100,
        }}>
          <div>
            <div style={{ fontSize:fs*16, fontWeight:800, color:"#fff", letterSpacing:.2 }}>🌊 {t.app}</div>
            <div style={{ fontSize:fs*9.5, color:"rgba(255,255,255,.6)", background:"rgba(255,255,255,.13)", borderRadius:4, padding:"1px 6px", display:"inline-block", marginTop:1, letterSpacing:.3 }}>
              {t.proto}
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {tabHistory.length > 1 && (
              <button onClick={goBack} style={{ background:"rgba(255,255,255,.18)", border:"1px solid rgba(255,255,255,.25)", borderRadius:9, padding:"7px 11px", cursor:"pointer", fontSize:fs*13, color:"#fff", fontWeight:600 }}>←</button>
            )}
            {/* Dark mode toggle */}
            <button onClick={() => setDarkMode(!darkMode)} style={{ background:"rgba(255,255,255,.18)", border:"1px solid rgba(255,255,255,.25)", borderRadius:9, padding:"7px 11px", cursor:"pointer", fontSize:16 }}>
              {darkMode ? "☀️" : "🌙"}
            </button>
            <button onClick={() => setShowSet(true)} style={{ background:"rgba(255,255,255,.18)", border:"1px solid rgba(255,255,255,.25)", borderRadius:9, padding:"7px 11px", cursor:"pointer", fontSize:fs*12.5, color:"#fff", fontWeight:600 }}>⚙️</button>
          </div>
        </div>

        {/* ── Emergency Banner ── */}
        <button onClick={() => window.open("tel:119")} className="pulse" style={{ background:C.red, padding:"9px 12px", textAlign:"center", fontSize:fs*12.5, fontWeight:800, color:"#fff", letterSpacing:.6, cursor:"pointer", border:"none", width:"100%", flexShrink:0 }}>
          {t.em}
        </button>

        {/* ── Content ── */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {tab==="home"      && <HomeScreen      {...commonProps} setTab={navigate}/>}
          {tab==="symptoms"  && <SymptomsScreen  {...commonProps}/>}
          {tab==="map"       && <MapScreen        {...commonProps} {...statusProps}/>}
          {tab==="hospitals" && <HospitalsScreen  {...commonProps} {...statusProps} setStatuses={setStatuses}/>}
          {tab==="chat"      && <ChatScreen       {...commonProps} user={user}/>}
          {tab==="profile"   && <ProfileScreen    {...commonProps} user={user} onSignOut={signOut}/>}
         
        </div>

        {/* ── Bottom Navigation ── */}
        <div style={{ width:"100%", background:dm.nav, backdropFilter:"blur(20px)", borderTop:`1px solid ${dm.border}`, display:"flex", flexShrink:0, boxShadow:"0 -4px 20px rgba(0,0,0,.1)", zIndex:100 }}>
          {TAB_KEYS.map((k, i) => (
            <button key={k} onClick={() => navigate(k)} style={{ flex:1, background:"none", border:"none", padding:"8px 2px 6px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, position:"relative" }}>
              <div style={{ width:26, height:26, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <img src={NAV_ICONS[i]} width={24} height={24} style={{ objectFit:"contain", opacity: tab===k ? 1 : 0.5 }}/>
                </div>
              <div style={{ fontSize:fs*9, fontWeight:tab===k?700:500, color:tab===k?C.p:dm.sub, lineHeight:1, textAlign:"center" }}>
                {labels[i]}
              </div>
              {tab===k && <div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:20, height:3, background:C.p, borderRadius:"2px 2px 0 0" }}/>}
            </button>
          ))}
          
        </div>

        {/* ── Settings Modal ── */}
        {showSet && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:999 }} onClick={() => setShowSet(false)}>
            <div style={{ background:dm.card, backdropFilter:"blur(24px)", borderRadius:"22px 22px 0 0", padding:24, width:"100%", maxWidth:430, boxShadow:"0 -10px 40px rgba(0,0,0,.3)" }} onClick={e => e.stopPropagation()}>
              <div style={{ width:34, height:4, background:dm.border, borderRadius:2, margin:"0 auto 20px" }}/>
              <div style={{ fontSize:fs*17, fontWeight:800, color:dm.text, marginBottom:6 }}>{t.settings.title}</div>
              <div style={{ fontSize:fs*12, color:dm.sub, marginBottom:18 }}>Signed in as <strong>{user?.email}</strong></div>

              {/* Dark mode */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:fs*11, fontWeight:700, color:dm.sub, marginBottom:10, textTransform:"uppercase", letterSpacing:.6 }}>Theme</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[[false,"☀️  Light"],[true,"🌙  Dark"]].map(([val, label]) => (
                    <button key={label} onClick={() => setDarkMode(val)} style={{ background: darkMode===val ? C.p : (darkMode ? "rgba(14,165,233,.15)" : C.pXL), color: darkMode===val ? "#fff" : dm.text, border:`1.5px solid ${darkMode===val ? C.p : dm.border}`, borderRadius:10, padding:"11px", fontWeight:600, fontSize:fs*13, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:fs*11, fontWeight:700, color:dm.sub, marginBottom:10, textTransform:"uppercase", letterSpacing:.6 }}>{t.settings.lang}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[["en","🇺🇸 English"],["ko","🇰🇷 한국어"],["zh","🇨🇳 中文"],["ja","🇯🇵 日本語"]].map(([l, label]) => (
                    <button key={l} onClick={() => setLang(l)} style={{ background:lang===l ? C.p : (darkMode ? "rgba(14,165,233,.15)" : C.pXL), color:lang===l ? "#fff" : dm.text, border:`1.5px solid ${lang===l ? C.p : dm.border}`, borderRadius:10, padding:"11px", fontWeight:600, fontSize:fs*13, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div style={{ marginBottom:22 }}>
                <div style={{ fontSize:fs*11, fontWeight:700, color:dm.sub, marginBottom:10, textTransform:"uppercase", letterSpacing:.6 }}>{t.settings.size}</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[["normal","A  Normal"],["large","A+  Large"]].map(([v, label]) => (
                    <button key={v} onClick={() => setFontSize(v)} style={{ background:fontSize===v ? C.p : (darkMode ? "rgba(14,165,233,.15)" : C.pXL), color:fontSize===v ? "#fff" : dm.text, border:`1.5px solid ${fontSize===v ? C.p : dm.border}`, borderRadius:10, padding:"12px", fontWeight:600, fontSize:v==="normal"?14:17, cursor:"pointer", fontFamily:"'Outfit',sans-serif" }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setShowSet(false)} style={{ background:C.pD, color:"#fff", border:"none", borderRadius:13, padding:"14px", fontFamily:"'Outfit',sans-serif", fontWeight:700, cursor:"pointer", width:"100%", fontSize:fs*15, marginBottom:10 }}>
                {t.settings.done}
              </button>
              <button onClick={() => { signOut(); setShowSet(false); }} style={{ background:C.rBg, color:C.red, border:`1.5px solid ${C.red}33`, borderRadius:13, padding:"12px", fontFamily:"'Outfit',sans-serif", fontWeight:700, cursor:"pointer", width:"100%", fontSize:fs*14 }}>
                🚪 Sign Out
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}