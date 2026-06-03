import { useState, useEffect, useRef } from "react";
import { C } from "../data/constants";

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are MediGuide, a friendly and professional AI health assistant built into the Jeju Medical app — a medical companion for international tourists visiting Jeju Island, South Korea.

IMPORTANT: Always respond in the SAME language the user writes in. If they write in Korean, respond in Korean. If Chinese, respond in Chinese. If Japanese, respond in Japanese. If English, respond in English.

Your role:
1. Help users understand symptoms and give general health guidance (always remind them to see a doctor for serious issues)
2. Guide users on how to use the Jeju Medical app features
3. Answer questions about finding hospitals, pharmacies, and emergency services in Jeju
4. Provide general health tips for tourists in Jeju (food safety, weather, seafood, etc.)
5. Emergency guidance — always remind users to call 119 for life-threatening emergencies

App Features:
- Home (홈/首页/ホーム): Overview, nearest hospital, quick access
- Symptoms (증상/症状/症状): Select symptoms for guidance and OTC medicine info
- Find Care (진료찾기/就医/医療): Google Map with all hospitals, ERs, pharmacies in Jeju with directions
- AI Chat (AI 채팅/AI助手/AIチャット): This chat — health assistant and app guide
- Profile/QR (프로필/档案/プロフィール): Medical profile that generates Korean QR code for doctors
- Language support: English, 한국어, 中文, 日本語
- Emergency: Red banner always links to 119

Key hospitals in Jeju (제주 주요 병원):
- 제주대학교병원 응급의료센터: 064-717-1114 (24h ER)
- 제주한라병원 응급실 (권역응급의료센터): 064-740-5000 (24h ER)
- 한마음병원 응급실: 064-750-9119 (24h ER)
- 제주한국병원 응급실: 064-750-0000 (24h ER)
- 서귀포의료원 응급의료센터: 064-730-3000 (24h ER)

Emergency: 119 (free, 24/7) | Tourist Medical: 1339

Always be warm, calm, and reassuring. Keep responses concise and practical.
Never provide specific medical diagnoses. Always recommend consulting a real doctor.
If someone describes a serious emergency, immediately tell them to call 119.`;


const UI = {
  en: {
    title: "MediGuide AI",
    online: "● Online · Health Assistant",
    placeholder: "Ask about symptoms, hospitals, or how to use the app…",
    welcome: `Hi 👋 I'm **MediGuide**, your Jeju health assistant!\n\nI can help you with:\n🏥 Finding hospitals & pharmacies\n🩺 Symptom guidance\n📱 How to use this app\n🚨 Emergency information\n\nWhat can I help you with today?`,
    suggestions: ["How do I use this app?", "Where is the nearest ER?", "I have a headache", "How do I find a pharmacy?", "What is the emergency number?", "How does the Medical QR work?"],
    error: "Sorry, I'm having trouble connecting. Please check your internet and try again.",
    typing: "MediGuide is typing…",
  },
  ko: {
    title: "MediGuide AI",
    online: "● 온라인 · 건강 어시스턴트",
    placeholder: "증상, 병원, 또는 앱 사용법에 대해 물어보세요…",
    welcome: `안녕하세요 👋 저는 제주 의료 앱의 **MediGuide**입니다!\n\n다음과 같은 도움을 드릴 수 있어요:\n🏥 병원 및 약국 찾기\n🩺 증상 안내\n📱 앱 사용 방법\n🚨 응급 정보\n\n무엇을 도와드릴까요?`,
    suggestions: ["앱 사용 방법이 궁금해요", "가장 가까운 응급실은?", "두통이 있어요", "약국을 찾고 싶어요", "응급 번호가 뭐예요?", "QR 코드는 어떻게 사용해요?"],
    error: "연결에 문제가 생겼어요. 인터넷을 확인하고 다시 시도해주세요.",
    typing: "MediGuide가 입력 중…",
  },
  zh: {
    title: "MediGuide AI",
    online: "● 在线 · 健康助手",
    placeholder: "询问症状、医院或如何使用此应用…",
    welcome: `您好 👋 我是济州医疗应用的 **MediGuide**！\n\n我可以帮助您：\n🏥 查找医院和药房\n🩺 症状指导\n📱 如何使用此应用\n🚨 紧急信息\n\n今天有什么可以帮助您的？`,
    suggestions: ["如何使用这个应用？", "最近的急诊室在哪里？", "我头痛", "如何找到药房？", "紧急电话是什么？", "医疗二维码怎么用？"],
    error: "连接出现问题，请检查网络后重试。",
    typing: "MediGuide 正在输入…",
  },
  ja: {
    title: "MediGuide AI",
    online: "● オンライン · 健康アシスタント",
    placeholder: "症状、病院、またはアプリの使い方について聞いてください…",
    welcome: `こんにちは 👋 私は済州医療アプリの **MediGuide** です！\n\n以下のことをお手伝いできます：\n🏥 病院・薬局の検索\n🩺 症状のガイダンス\n📱 アプリの使い方\n🚨 緊急情報\n\n今日は何をお手伝いしましょうか？`,
    suggestions: ["アプリの使い方は？", "最寄りの救急室は？", "頭痛があります", "薬局を探したい", "緊急番号は何ですか？", "医療QRコードの使い方は？"],
    error: "接続に問題が発生しました。インターネットを確認してもう一度試してください。",
    typing: "MediGuide が入力中…",
  },
};

export default function ChatScreen({ t, fs, lang, onBack, user }) {
  const ui = UI[lang] || UI.en;

  const [messages, setMessages] = useState([
    { role:"assistant", text: ui.welcome }
  ]);
  const [input,  setInput]  = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  // Reset welcome message when language changes
  useEffect(() => {
    const newUi = UI[lang] || UI.en;
    setMessages([{ role:"assistant", text: newUi.welcome }]);
  }, [lang]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, typing]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || typing) return;
    setInput("");

    const userMsg  = { role:"user", text:msg };
    const newMsgs  = [...messages, userMsg];
    setMessages(newMsgs);
    setTyping(true);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model:      GROQ_MODEL,
          max_tokens: 600,
          temperature: 0.7,
          messages: [
            { role:"system", content: SYSTEM_PROMPT },
            ...newMsgs.map(m => ({
              role:    m.role === "assistant" ? "assistant" : "user",
              content: m.text,
            })),
          ],
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Groq error:", res.status, errData);
        throw new Error(`API error ${res.status}`);
      }

      const data  = await res.json();
      const reply = data.choices?.[0]?.message?.content?.trim()
        || (UI[lang] || UI.en).error;

      setMessages(prev => [...prev, { role:"assistant", text:reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role:"assistant", text: (UI[lang] || UI.en).error }]);
    }
    setTyping(false);
  };

  // Simple bold renderer **text**
  const renderText = (text) =>
    text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 140px)", fontFamily:"'Outfit',sans-serif" }}>

      {/* Header */}
      <div style={{ padding:"14px 16px 10px", flexShrink:0, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", color:C.p, fontWeight:600, fontSize:fs*14, cursor:"pointer", padding:0, flexShrink:0 }}>←</button>
          <div style={{ width:42, height:42, borderRadius:14, background:`linear-gradient(135deg,${C.p},#06B6D4)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🤖</div>
          <div>
            <div style={{ fontSize:fs*15, fontWeight:800, color:C.text }}>{ui.title}</div>
            <div style={{ fontSize:fs*11, color:C.green, fontWeight:600 }}>{ui.online}</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:"flex", justifyContent: m.role==="user" ? "flex-end" : "flex-start" }}>
            {m.role === "assistant" && (
              <div style={{ width:30, height:30, borderRadius:10, background:`linear-gradient(135deg,${C.p},#06B6D4)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, marginRight:7, flexShrink:0, alignSelf:"flex-end" }}>
                🤖
              </div>
            )}
            <div style={{
              maxWidth:"78%",
              background:    m.role==="user" ? `linear-gradient(135deg,${C.pD},${C.p})` : "rgba(255,255,255,.95)",
              border:        m.role==="user" ? "none" : `1px solid ${C.border}`,
              color:         m.role==="user" ? "#fff" : C.text,
              borderRadius:  m.role==="user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding:       "11px 14px",
              fontSize:      fs*13,
              lineHeight:    1.65,
              boxShadow:     "0 2px 12px rgba(8,145,178,.08)",
              whiteSpace:    "pre-wrap",
              wordBreak:     "break-word",
            }}>
              {renderText(m.text)}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:30, height:30, borderRadius:10, background:`linear-gradient(135deg,${C.p},#06B6D4)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🤖</div>
            <div style={{ background:"rgba(255,255,255,.95)", border:`1px solid ${C.border}`, borderRadius:"18px 18px 18px 4px", padding:"12px 16px", display:"flex", gap:5, alignItems:"center" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:C.p, animation:`wave 1s ease-in-out ${i*0.15}s infinite` }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {/* Suggestion chips — show only at start */}
      {messages.length <= 1 && (
        <div style={{ padding:"6px 16px 0", display:"flex", gap:7, overflowX:"auto", flexShrink:0 }}>
          {ui.suggestions.map(q => (
            <button
              key={q}
              onClick={() => send(q)}
              style={{
                flexShrink:0,
                background:   C.pXL,
                color:        C.pD,
                border:       `1px solid ${C.border}`,
                borderRadius: 20,
                padding:      "6px 14px",
                fontSize:     fs*11.5,
                fontWeight:   600,
                cursor:       "pointer",
                whiteSpace:   "nowrap",
                fontFamily:   "'Outfit',sans-serif",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div style={{ padding:"10px 16px 16px", display:"flex", gap:10, flexShrink:0 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !typing && send()}
          placeholder={ui.placeholder}
          style={{
            flex:1, padding:"12px 16px", borderRadius:14,
            border:`1.5px solid ${C.border}`,
            fontSize:fs*13, color:C.text,
            background:"rgba(255,255,255,.95)",
            fontFamily:"'Outfit',sans-serif",
          }}
        />
        <button
          onClick={() => send()}
          disabled={typing || !input.trim()}
          style={{
            background:   typing || !input.trim() ? C.border : C.p,
            color:        "#fff",
            border:       "none",
            borderRadius: 14,
            padding:      "12px 16px",
            fontSize:     20,
            cursor:       typing || !input.trim() ? "default" : "pointer",
            boxShadow:    typing || !input.trim() ? "none" : `0 4px 14px ${C.p}55`,
            transition:   "all .18s ease",
            flexShrink:   0,
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}