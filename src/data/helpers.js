import { C } from "./constants";

export const isStale = (u) =>
  Boolean(u && (u.includes("hr") || u.includes("hour") || u.includes("day")));

export const buildKo = (p) => `[제주 의료 가이드 - 환자 정보]
성명: ${p.name    || "미입력"}
국적: ${p.nat     || "미입력"}
선호 언어: ${p.lang || "미입력"}
혈액형: ${p.blood   || "미입력"}
알레르기: ${p.allergy || "없음"}
만성 질환: ${p.disease || "없음"}
복용 약물: ${p.meds   || "없음"}
비상 연락처: ${p.contact || "미입력"}`;

export const cd = (extra = {}) => ({
  background: C.card, borderRadius: 16,
  boxShadow: "0 2px 14px rgba(8,145,178,.09)",
  border: `1px solid ${C.border}`, padding: 16, ...extra,
});

export const bt = (bg, col = "#fff", ex = {}) => ({
  background: bg, color: col, border: "none", borderRadius: 12,
  padding: "12px 20px", fontFamily: "'Outfit',sans-serif",
  fontWeight: 700, cursor: "pointer", width: "100%", fontSize: 14, ...ex,
});