import { useState } from "react";
import { sb } from "../lib/supabase";
import { C } from "../data/constants";

export default function AuthScreen({ onAuth }) {
  const [mode,     setMode]     = useState("login"); // "login" | "signup"
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  const handle = async () => {
    setError(""); setSuccess("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return; }
    setLoading(true);

    if (mode === "signup") {
      const { error: e } = await sb.auth.signUp({ email, password });
      if (e) { setError(e.message); setLoading(false); return; }
      setSuccess("Account created! Please check your email to confirm, then log in.");
      setMode("login"); setPassword("");
    } else {
      const { data, error: e } = await sb.auth.signInWithPassword({ email, password });
      if (e) { setError(e.message); setLoading(false); return; }
      onAuth(data.user);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:"100vh", background:`linear-gradient(135deg, ${C.pD} 0%, ${C.p} 60%, #06B6D4 100%)`,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:24, fontFamily:"'Outfit',sans-serif",
    }}>
      {/* Logo */}
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ fontSize:52, marginBottom:8 }}>🌊</div>
        <div style={{ fontSize:26, fontWeight:800, color:"#fff", letterSpacing:-.3 }}>Jeju Medical</div>
        <div style={{ fontSize:13, color:"rgba(255,255,255,.7)", marginTop:4 }}>
          Medical companion for international visitors
        </div>
      </div>

      {/* Card */}
      <div style={{
        width:"100%", maxWidth:380,
        background:"rgba(255,255,255,.95)",
        backdropFilter:"blur(24px)",
        borderRadius:24, padding:28,
        boxShadow:"0 24px 60px rgba(0,0,0,.2)",
      }}>
        {/* Tab toggle */}
        <div style={{ display:"flex", background:C.pXL, borderRadius:14, padding:4, marginBottom:24 }}>
          {[["login","Log In"],["signup","Sign Up"]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }}
              style={{
                flex:1, padding:"10px", borderRadius:11, border:"none",
                background: mode === m ? C.p : "transparent",
                color:      mode === m ? "#fff" : C.sub,
                fontWeight:700, fontSize:14, cursor:"pointer",
                fontFamily:"'Outfit',sans-serif",
                transition:"all .18s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Fields */}
        {[
          { label:"Email", val:email, set:setEmail, type:"email",    ph:"your@email.com"  },
          { label:"Password", val:password, set:setPassword, type:"password", ph:"min. 6 characters" },
        ].map(({ label, val, set, type, ph }) => (
          <div key={label} style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:700, color:C.sub, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:.4 }}>
              {label}
            </label>
            <input
              type={type} value={val}
              onChange={e => set(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handle()}
              placeholder={ph}
              style={{
                width:"100%", padding:"12px 14px", borderRadius:12,
                border:`1.5px solid ${C.border}`,
                fontSize:14, color:C.text, background:"#F8FBFF",
                fontFamily:"'Outfit',sans-serif",
              }}
            />
          </div>
        ))}

        {/* Error / Success */}
        {error   && <div style={{ background:C.rBg,  color:C.red,   borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:14, border:`1px solid ${C.red}33`   }}>{error}</div>}
        {success && <div style={{ background:C.gBg,  color:C.gDark, borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:14, border:`1px solid ${C.green}33` }}>{success}</div>}

        {/* Submit */}
        <button
          onClick={handle}
          disabled={loading}
          style={{
            width:"100%", padding:"14px", borderRadius:14, border:"none",
            background: loading ? C.border : `linear-gradient(135deg, ${C.pD}, ${C.p})`,
            color:"#fff", fontWeight:800, fontSize:16, cursor: loading ? "default" : "pointer",
            fontFamily:"'Outfit',sans-serif",
            boxShadow: loading ? "none" : `0 6px 20px ${C.p}55`,
            transition:"all .18s ease",
          }}
        >
          {loading ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
        </button>
      </div>

      <div style={{ fontSize:11, color:"rgba(255,255,255,.5)", marginTop:20, textAlign:"center" }}>
        🎓 University project · Not for clinical use
      </div>
    </div>
  );
}