export const GS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:#055F7A;font-family:'Outfit',sans-serif}
::-webkit-scrollbar{display:none}
input,select,textarea{font-family:'Outfit',sans-serif;outline:none}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse2{0%,100%{opacity:1}50%{opacity:.55}}
.fi{animation:fadeIn .28s ease forwards}
.pulse{animation:pulse2 2.2s infinite}
`;

export const C = {
  p:    "#0ABAB5",  // tiffany blue       (was cyan)
  pD:   "#078F8B",  // deeper tiffany     (was dark cyan)
  pL:   "#A0DEDD",  // light teal border  (was pL)
  pXL:  "#E6F7F7",  // mist tint bg       (was sky tint)

  green:"#059669",  // keep — used for "available" status
  gBg:  "#DCFCE7",  // keep
  gDark:"#065F46",  // keep

  amber:"#D97706",  // keep — used for stale warnings
  aBg:  "#FEF9C3",  // keep

  red:  "#E03E3E",  // slightly softer red (was #DC2626)
  rBg:  "#FEECEC",  // keep — red tint bg

  sky:  "#E6F7F7",  // now tiffany mist   (was light blue)
  card: "#FFFFFF",  // keep
  text: "#1A1A1A",  // onyx               (was dark cyan text)
  sub:  "#9BA8A8",  // silver gray        (was slate)
  border:"#DDE6E6", // soft teal border   (was light blue)
};

export const SC = {
  AVAILABLE:    { c:C.green, bg:C.gBg },
  WAITING:      { c:C.amber, bg:C.aBg },
  NOT_AVAILABLE:{ c:C.red,   bg:C.rBg },
};

export const SL = {
  AVAILABLE:    { en:"ACCEPTING PATIENTS", ko:"진료 가능",  zh:"可接诊",   ja:"受付可能" },
  WAITING:      { en:"WAITING",            ko:"대기 중",    zh:"等待中",   ja:"待機中"   },
  NOT_AVAILABLE:{ en:"FULL / CLOSED",      ko:"진료 불가",  zh:"无法接诊", ja:"受付不可" },
};

export const SCYCLE = ["AVAILABLE", "WAITING", "NOT_AVAILABLE"];