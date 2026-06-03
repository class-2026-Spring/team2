import { useState, useEffect, useRef } from "react";
import { C, SC, SL } from "../data/constants";
import { isStale } from "../data/helpers";
import { LOCS } from "../data/data";

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
const FILTER_KEYS = ["All", "Hospitals", "Pharmacies", "ER Only"];

export default function MapScreen({ t, fs, statuses, lang }) {
  const s = t.map;

  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef     = useRef([]);
  const userMarkerRef  = useRef(null);

  const [filter,   setFilter]   = useState("All");
  const [sel,      setSel]      = useState(null);
  const [userPos,  setUserPos]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [locating, setLocating] = useState(false);
  const [listView, setListView] = useState(false);
  const [mapError, setMapError] = useState(false);

  // ── Load Google Maps SDK then init map ─────────────────────────────────────
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;
      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 33.4996, lng: 126.5312 },
          zoom: 12,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          styles: [
            { featureType:"water",         elementType:"geometry",  stylers:[{ color:"#BAE6FD" }] },
            { featureType:"landscape",     elementType:"geometry",  stylers:[{ color:"#F0F9FF" }] },
            { featureType:"road",          elementType:"geometry",  stylers:[{ color:"#ffffff" }] },
            { featureType:"road.arterial", elementType:"geometry",  stylers:[{ color:"#E0F2FE" }] },
            { featureType:"road.highway",  elementType:"geometry",  stylers:[{ color:"#BAE6FD" }] },
            { featureType:"poi.park",      elementType:"geometry",  stylers:[{ color:"#D1FAE5" }] },
            { featureType:"transit",       elementType:"geometry",  stylers:[{ color:"#E0F2FE" }] },
            { elementType:"labels.text.stroke", stylers:[{ color:"#ffffff" }] },
            { elementType:"labels.text.fill",   stylers:[{ color:"#0C4A6E" }] },
          ],
        });
        mapInstanceRef.current = map;
        setLoading(false);
        placeMarkers(map, "All");
      } catch (err) {
        console.error("Google Maps init error:", err);
        setMapError(true);
        setLoading(false);
      }
    };

    if (window.google && window.google.maps) {
      requestAnimationFrame(initMap);
      return;
    }

    const existing = document.getElementById("google-maps-sdk");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.id    = "google-maps-sdk";
    script.src   = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload  = () => requestAnimationFrame(initMap);
    script.onerror = () => { setMapError(true); setLoading(false); };
    document.head.appendChild(script);
  }, []);

  // ── Place markers from LOCS  ─────────────────────────
  const placeMarkers = (map, currentFilter) => {
    if (!window.google || !map) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const visible = LOCS.filter(l => {
      if (currentFilter === "Hospitals")  return l.type === "hospital";
      if (currentFilter === "Pharmacies") return l.type === "pharmacy";
      if (currentFilter === "ER Only")    return l.er;
      return true;
    });

    visible.forEach(loc => {
      const pinColor = loc.er ? "#FB7185" : loc.type === "hospital" ? C.p : C.green;
      const emoji    = loc.er ? "🚨" : loc.type === "hospital" ? "🏥" : "💊";

      const el = document.createElement("div");
      el.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;";
      el.innerHTML = `
        <div style="
          width:42px;height:42px;
          border-radius:50% 50% 50% 4px;
          background:${pinColor};
          border:3px solid #fff;
          box-shadow:0 4px 16px ${pinColor}88;
          display:flex;align-items:center;justify-content:center;
          font-size:18px;
          transform:rotate(-45deg);
          transition:transform .15s ease,box-shadow .15s ease;
        ">
          <span style="display:block;transform:rotate(45deg);line-height:1">${emoji}</span>
        </div>
      `;

      const pin = el.querySelector("div");
      el.addEventListener("mouseenter", () => {
        pin.style.transform  = "rotate(-45deg) scale(1.2)";
        pin.style.boxShadow  = `0 8px 24px ${pinColor}aa`;
      });
      el.addEventListener("mouseleave", () => {
        pin.style.transform  = "rotate(-45deg) scale(1)";
        pin.style.boxShadow  = `0 4px 16px ${pinColor}88`;
      });
      el.addEventListener("click", () => {
        setSel(loc);
        map.panTo({ lat: loc.lat, lng: loc.lng });
        map.setZoom(14);
      });

      const overlay = new window.google.maps.OverlayView();
      overlay.onAdd = function () {
        this.getPanes().overlayMouseTarget.appendChild(el);
      };
      overlay.draw = function () {
        const proj = this.getProjection();
        const pos  = proj.fromLatLngToDivPixel(
          new window.google.maps.LatLng(loc.lat, loc.lng)
        );
        if (pos) {
          el.style.position = "absolute";
          el.style.left     = `${pos.x - 21}px`;
          el.style.top      = `${pos.y - 42}px`;
        }
      };
      overlay.onRemove = function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      };
      overlay.setMap(map);
      markersRef.current.push(overlay);
    });
  };

  // ── Re-place markers when filter changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      placeMarkers(mapInstanceRef.current, filter);
      setSel(null);
    }
  }, [filter]);

  // ── Get user GPS location
  const locateUser = () => {
    const map = mapInstanceRef.current;
    if (!map) { alert("Map not ready yet. Please wait."); return; }
    if (!navigator.geolocation) { alert("Your browser does not support geolocation."); return; }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setUserPos({ lat, lng });
        setLocating(false);

        if (userMarkerRef.current) userMarkerRef.current.setMap(null);

        const dot = document.createElement("div");
        dot.style.cssText = `
          width:18px;height:18px;border-radius:50%;
          background:#3B82F6;border:3px solid #fff;
          box-shadow:0 0 0 7px rgba(59,130,246,.25);
          position:absolute;
          transform:translate(-50%,-50%);
        `;

        const userOverlay = new window.google.maps.OverlayView();
        userOverlay.onAdd = function () {
          this.getPanes().overlayLayer.appendChild(dot);
        };
        userOverlay.draw = function () {
          const proj = this.getProjection();
          const pos  = proj.fromLatLngToDivPixel(
            new window.google.maps.LatLng(lat, lng)
          );
          if (pos) {
            dot.style.left = `${pos.x}px`;
            dot.style.top  = `${pos.y}px`;
          }
        };
        userOverlay.onRemove = function () {
          if (dot.parentNode) dot.parentNode.removeChild(dot);
        };
        userOverlay.setMap(map);
        userMarkerRef.current = userOverlay;

        map.panTo({ lat, lng });
        map.setZoom(13);
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          alert("Location access denied.\n\nClick the 🔒 icon in your browser address bar → Allow Location → Refresh.");
        } else {
          alert("Could not get your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ── Open Google Maps directions ────────────────────────────────────────────
  const getDirections = (loc) => {
    if (userPos) {
      window.open(
        `https://www.google.com/maps/dir/${userPos.lat},${userPos.lng}/${loc.lat},${loc.lng}`,
        "_blank"
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`,
        "_blank"
      );
    }
  };

  // ── From list view: pan map to location ───────────────────────────────────
  const panToLocation = (loc) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: loc.lat, lng: loc.lng });
      mapInstanceRef.current.setZoom(14);
    }
    setSel(loc);
    setListView(false);
  };

  // ── Filtered list
  const filteredList = LOCS.filter(l => {
    if (filter === "Hospitals")  return l.type === "hospital";
    if (filter === "Pharmacies") return l.type === "pharmacy";
    if (filter === "ER Only")    return l.er;
    return true;
  });

  // ── RENDER
  return (
    <div style={{ paddingBottom:16 }}>

      {/* Header */}
      <div style={{ padding:"16px 16px 0" }}>
        <div style={{ fontSize:fs*18, fontWeight:800, color:C.text, marginBottom:2 }}>
          {s.title}
        </div>
        <div style={{ fontSize:fs*12.5, color:C.sub, marginBottom:12 }}>
          {userPos ? "📍 Using your location" : s.sub}
        </div>

        {/* Filter pills */}
        <div style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:4, marginBottom:10 }}>
          {s.filt.map((f, i) => {
            const active = filter === FILTER_KEYS[i];
            return (
              <button
                key={i}
                onClick={() => setFilter(FILTER_KEYS[i])}
                style={{
                  flexShrink:0,
                  background:  active ? C.p : C.card,
                  color:       active ? "#fff" : C.sub,
                  border:      `1.5px solid ${active ? C.p : C.border}`,
                  borderRadius:20, padding:"7px 15px",
                  fontSize:fs*12.5, fontWeight:600,
                  cursor:"pointer", whiteSpace:"nowrap",
                  fontFamily:"'Outfit',sans-serif",
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Map / List toggle */}
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          {[{ v:false, label:"🗺️ Map" }, { v:true, label:"📋 List" }].map(({ v, label }) => (
            <button
              key={label}
              onClick={() => setListView(v)}
              style={{
                flex:1, padding:"10px", borderRadius:12, border:"none",
                background:  listView === v ? C.p : C.pXL,
                color:       listView === v ? "#fff" : C.sub,
                fontWeight:600, fontSize:fs*13, cursor:"pointer",
                fontFamily:"'Outfit',sans-serif",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAP VIEW ── */}
      {!listView && (
        <div style={{ padding:"0 16px" }}>

          {/* Fixed-height map container */}
          <div style={{
            width:"100%", height:420,
            borderRadius:20, overflow:"hidden",
            position:"relative",
            boxShadow:"0 8px 32px rgba(8,145,178,.15)",
            background:C.pXL,
            marginBottom:12,
          }}>
            {/* Google Map renders here */}
            <div ref={mapRef} style={{ width:"100%", height:"100%" }}/>

            {/* Loading spinner */}
            {loading && (
              <div style={{
                position:"absolute", inset:0, zIndex:10,
                background:C.pXL,
                display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:12,
              }}>
                <div style={{
                  width:40, height:40,
                  border:`3px solid ${C.border}`,
                  borderTop:`3px solid ${C.p}`,
                  borderRadius:"50%",
                  animation:"spin 1s linear infinite",
                }}/>
                <div style={{ fontSize:fs*13, color:C.sub }}>Loading Google Maps…</div>
              </div>
            )}

            {/* Error state */}
            {mapError && !loading && (
              <div style={{
                position:"absolute", inset:0, zIndex:10,
                background:C.pXL,
                display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:8,
              }}>
                <div style={{ fontSize:36 }}>⚠️</div>
                <div style={{ fontSize:fs*14, color:C.text, fontWeight:700 }}>Map failed to load</div>
                <div style={{ fontSize:fs*11, color:C.sub, textAlign:"center", padding:"0 24px", lineHeight:1.6 }}>
                  Check your internet connection or Google Maps API key.
                </div>
              </div>
            )}

            {/* Legend */}
            {!loading && !mapError && (
              <div style={{
                position:"absolute", top:12, left:12, zIndex:5,
                background:"rgba(255,255,255,.95)",
                backdropFilter:"blur(10px)",
                borderRadius:12, padding:"8px 12px",
                border:`1px solid ${C.border}`,
                fontSize:fs*11,
                boxShadow:"0 4px 12px rgba(8,145,178,.1)",
              }}>
                {[
                  ["#FB7185", "ER Hospital"],
                  [C.p,       "Hospital"],
                  [C.green,   "Pharmacy"],
                  ["#3B82F6", "You"],
                ].map(([color, label]) => (
                  <div key={label} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                    <span style={{ width:10, height:10, borderRadius:"50%", background:color, display:"inline-block", flexShrink:0 }}/>
                    <span style={{ color:C.text }}>{label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* My location button */}
            {!loading && !mapError && (
              <button
                onClick={locateUser}
                style={{
                  position:"absolute", top:12, right:12, zIndex:5,
                  width:42, height:42, borderRadius:12,
                  background:"rgba(255,255,255,.95)",
                  backdropFilter:"blur(10px)",
                  border:`1px solid ${C.border}`,
                  cursor:"pointer", fontSize:20,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:"0 4px 12px rgba(8,145,178,.1)",
                }}
              >
                {locating ? "⏳" : "📍"}
              </button>
            )}
          </div>

          {/* Selected location card */}
          {sel && (
            <div style={{
              background:"rgba(255,255,255,.95)",
              backdropFilter:"blur(20px)",
              borderRadius:20, padding:16,
              boxShadow:"0 8px 32px rgba(8,145,178,.15)",
              border:`1px solid ${C.border}`,
              animation:"fadeIn .25s ease",
            }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10 }}>
                <div style={{
                  width:44, height:44, borderRadius:14, flexShrink:0,
                  background: sel.type === "hospital" ? C.pL : C.gBg,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
                }}>
                  {sel.er ? "🚨" : sel.type === "hospital" ? "🏥" : "💊"}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:fs*14, fontWeight:700, color:C.text, lineHeight:1.3, marginBottom:2 }}>
                    {sel.name}
                  </div>
                  <div style={{ fontSize:fs*11, color:C.sub }}>{sel.ko} · {sel.dist}</div>
                  {statuses[sel.id] && (
                    <div style={{
                      marginTop:5, display:"inline-flex", alignItems:"center", gap:5,
                      background:SC[statuses[sel.id].s].bg,
                      borderRadius:8, padding:"3px 9px",
                      border:`1px solid ${SC[statuses[sel.id].s].c}33`,
                    }}>
                      <span style={{ width:7, height:7, borderRadius:"50%", background:SC[statuses[sel.id].s].c }}/>
                      <span style={{ fontSize:fs*11, fontWeight:700, color:SC[statuses[sel.id].s].c }}>
                        {SL[statuses[sel.id].s][lang] || SL[statuses[sel.id].s].en}
                      </span>
                      {isStale(statuses[sel.id].upd) && (
                        <span style={{ fontSize:fs*10, color:C.sub }}>· ⚠️ {t.hospitals.stale}</span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSel(null)}
                  style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:C.sub, padding:4, flexShrink:0 }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize:fs*12, color:C.sub, marginBottom:8 }}>
                🕐 {sel.hours} &nbsp;·&nbsp; 📞 {sel.phone}
              </div>

              {sel.langs && sel.langs.length > 0 && (
                <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:12, alignItems:"center" }}>
                  <span style={{ fontSize:fs*11, color:C.sub }}>🌐</span>
                  {sel.langs.map(l => (
                    <span
                      key={l}
                      style={{ background:C.pXL, color:C.p, borderRadius:6, padding:"2px 8px", fontSize:fs*11, fontWeight:600, border:`1px solid ${C.border}` }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display:"flex", gap:8 }}>
                <button
                  onClick={() => getDirections(sel)}
                  style={{ flex:1, background:C.p, color:"#fff", border:"none", borderRadius:12, padding:"11px", fontWeight:700, fontSize:fs*13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}
                >
                  🗺️ {s.dir}
                </button>
                <button
                  onClick={() => window.open(`tel:${sel.phone}`)}
                  style={{ background:C.pXL, color:C.p, border:`1.5px solid ${C.border}`, borderRadius:12, padding:"11px 16px", fontWeight:700, fontSize:fs*13, cursor:"pointer" }}
                >
                  📞
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {listView && (
        <div style={{ padding:"0 16px" }}>
          {filteredList.length === 0 && (
            <div style={{ textAlign:"center", color:C.sub, padding:40, fontSize:fs*14 }}>
              {s.noR}
            </div>
          )}
          {filteredList.map(loc => (
            <div
              key={loc.id}
              onClick={() => panToLocation(loc)}
              style={{
                background:"rgba(255,255,255,.85)",
                backdropFilter:"blur(20px)",
                borderRadius:16,
                border:`1px solid ${C.border}`,
                boxShadow:"0 4px 14px rgba(8,145,178,.08)",
                marginBottom:12,
                overflow:"hidden",
                cursor:"pointer",
              }}
            >
              <div style={{ padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:8 }}>
                  <div style={{
                    width:44, height:44, borderRadius:13, flexShrink:0,
                    background: loc.type === "hospital" ? C.pL : C.gBg,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
                  }}>
                    {loc.er ? "🚨" : loc.type === "hospital" ? "🏥" : "💊"}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:4 }}>
                      <span style={{
                        background: loc.type === "hospital" ? C.pL : C.gBg,
                        color:      loc.type === "hospital" ? C.p  : C.gDark,
                        borderRadius:6, padding:"2px 8px",
                        fontSize:fs*10.5, fontWeight:700, textTransform:"uppercase",
                      }}>
                        {loc.type === "hospital" ? "🏥 Hospital" : "💊 Pharmacy"}
                      </span>
                      {loc.er && (
                        <span style={{ background:C.rBg, color:C.red, borderRadius:6, padding:"2px 8px", fontSize:fs*10.5, fontWeight:700 }}>
                          {s.er}
                        </span>
                      )}
                      <span style={{
                        background: loc.open ? C.gBg : C.rBg,
                        color:      loc.open ? C.green : C.red,
                        borderRadius:6, padding:"2px 8px", fontSize:fs*10.5, fontWeight:700,
                      }}>
                        {loc.open ? `● ${s.open}` : `○ ${s.closed}`}
                      </span>
                    </div>
                    <div style={{ fontSize:fs*14, fontWeight:700, color:C.text, lineHeight:1.2 }}>
                      {loc.name}
                    </div>
                    <div style={{ fontSize:fs*11, color:C.sub }}>{loc.ko} · {loc.dist}</div>
                  </div>
                  {statuses[loc.id] && (
                    <div style={{
                      flexShrink:0,
                      display:"inline-flex", alignItems:"center", gap:5,
                      background:SC[statuses[loc.id].s].bg,
                      borderRadius:8, padding:"3px 9px",
                      border:`1px solid ${SC[statuses[loc.id].s].c}33`,
                    }}>
                      <span style={{ width:7, height:7, borderRadius:"50%", background:SC[statuses[loc.id].s].c }}/>
                      <span style={{ fontSize:fs*10.5, fontWeight:700, color:SC[statuses[loc.id].s].c }}>
                        {SL[statuses[loc.id].s][lang] || SL[statuses[loc.id].s].en}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display:"flex", gap:8 }}>
                  <button
                    onClick={e => { e.stopPropagation(); getDirections(loc); }}
                    style={{ flex:1, background:C.p, color:"#fff", border:"none", borderRadius:11, padding:"10px", fontWeight:700, fontSize:fs*12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}
                  >
                    🗺️ {s.dir}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); window.open(`tel:${loc.phone}`); }}
                    style={{ background:C.pXL, color:C.p, border:`1.5px solid ${C.border}`, borderRadius:11, padding:"10px 14px", fontWeight:700, fontSize:fs*12, cursor:"pointer" }}
                  >
                    📞
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}