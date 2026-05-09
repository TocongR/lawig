import { useRef, useState, useCallback } from "react";
import ObjectNode from "./ObjectNode";
import InputPopup from "./InputPopup";

const STARS = Array.from({ length: 180 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: Math.random() * 1.4 + 0.2,
  o: Math.random() * 0.5 + 0.08,
  twinkle: Math.random() > 0.7,
  dur: (Math.random() * 3 + 2).toFixed(1),
  delay: (Math.random() * 4).toFixed(1),
}));

const NEBULA_ORBS = [
  { cx: "20%", cy: "30%", rx: 280, ry: 200, color: "rgba(80,60,180,0.09)" },
  { cx: "75%", cy: "20%", rx: 220, ry: 160, color: "rgba(60,100,200,0.07)" },
  { cx: "60%", cy: "75%", rx: 320, ry: 220, color: "rgba(100,60,160,0.08)" },
  { cx: "15%", cy: "80%", rx: 180, ry: 140, color: "rgba(40,80,180,0.06)" },
  { cx: "85%", cy: "60%", rx: 240, ry: 180, color: "rgba(80,40,140,0.07)" },
];

export default function Canvas({ objects, onAdd }) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [popup, setPopup] = useState(null);
  const [showGoto, setShowGoto] = useState(false);
  const [gotoInput, setGotoInput] = useState({ x: "", y: "" });
  const [gotoError, setGotoError] = useState("");

  const isPanning = useRef(false);
  const panStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const didDrag = useRef(false);
  const containerRef = useRef(null);
  const panRef = useRef({ x: 0, y: 0 });

  const updatePan = (newPan) => {
    panRef.current = newPan;
    setPan(newPan);
  };

  const centerX = Math.round(-pan.x);
  const centerY = Math.round(-pan.y);

  const toWorld = useCallback((sx, sy) => ({
    x: sx - pan.x,
    y: sy - pan.y,
  }), [pan]);

  // ── Mouse ────────────────────────────────────────────────────────────────────

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    didDrag.current = false;
    panStart.current = { mx: e.clientX, my: e.clientY, px: panRef.current.x, py: panRef.current.y };
  };

  const onMouseMove = (e) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.mx;
    const dy = e.clientY - panStart.current.my;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
    updatePan({ x: panStart.current.px + dx, y: panStart.current.py + dy });
  };

  const onMouseUp = (e) => {
    isPanning.current = false;
    if (!didDrag.current && !showGoto) {
      const rect = containerRef.current.getBoundingClientRect();
      const world = toWorld(e.clientX - rect.left, e.clientY - rect.top);
      setPopup({ canvasX: world.x, canvasY: world.y });
    }
  };

  // ── Touch ────────────────────────────────────────────────────────────────────

  const onTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    isPanning.current = true;
    didDrag.current = false;
    panStart.current = { mx: t.clientX, my: t.clientY, px: panRef.current.x, py: panRef.current.y };
  };

  const onTouchMove = (e) => {
    if (!isPanning.current || e.touches.length !== 1) return;
    e.preventDefault();
    const t = e.touches[0];
    const dx = t.clientX - panStart.current.mx;
    const dy = t.clientY - panStart.current.my;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didDrag.current = true;
    updatePan({ x: panStart.current.px + dx, y: panStart.current.py + dy });
  };

  const onTouchEnd = (e) => {
    isPanning.current = false;
    if (!didDrag.current && !showGoto && e.changedTouches.length === 1) {
      const t = e.changedTouches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const world = toWorld(t.clientX - rect.left, t.clientY - rect.top);
      setPopup({ canvasX: world.x, canvasY: world.y });
    }
  };

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleAdd = (text) => {
    if (!popup) return;
    onAdd({ x: popup.canvasX, y: popup.canvasY, text });
    setPopup(null);
  };

  const flyTo = (wx, wy) => {
    const targetPanX = -wx;
    const targetPanY = -wy;
    const startX = panRef.current.x;
    const startY = panRef.current.y;
    const startTime = performance.now();
    const duration = 900;
    const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const animate = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const e = easeInOut(t);
      const newPan = { x: startX + (targetPanX - startX) * e, y: startY + (targetPanY - startY) * e };
      panRef.current = newPan;
      setPan(newPan);
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  const resetView = () => flyTo(0, 0);

  const handleGoto = () => {
    const wx = parseInt(gotoInput.x);
    const wy = parseInt(gotoInput.y);
    if (isNaN(wx) || isNaN(wy)) { setGotoError("enter valid coordinates"); return; }
    setGotoError("");
    setShowGoto(false);
    setGotoInput({ x: "", y: "" });
    flyTo(wx, wy);
  };

  const copyCoords = () => navigator.clipboard?.writeText(`${centerX}, ${centerY}`);

  // HUD stop — blocks canvas touch/pointer without preventDefault (so inputs still work)
  const hudStop = (e) => e.stopPropagation();

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Canvas ── */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          background: "#07080f",
          cursor: "crosshair",
          touchAction: "none",
        }}
      >
        {/* Galaxy background */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", display: "block" }}>
          <defs>
            {NEBULA_ORBS.map((orb, i) => (
              <radialGradient key={i} id={`neb${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={orb.color} />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            ))}
          </defs>
          {NEBULA_ORBS.map((orb, i) => (
            <ellipse key={i} cx={orb.cx} cy={orb.cy} rx={orb.rx} ry={orb.ry} fill={`url(#neb${i})`} />
          ))}
          {STARS.map((s) => (
            <circle
              key={s.id}
              cx={`${s.x}%`}
              cy={`${s.y}%`}
              r={s.r}
              fill="white"
              opacity={s.o}
              style={s.twinkle ? { "--op": s.o, animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite` } : {}}
            />
          ))}
        </svg>

        {/* World layer */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: "0 0",
            willChange: "transform",
          }}
        >
          {objects.map((obj) => (
            <ObjectNode key={obj.id} obj={obj} />
          ))}
          {popup && (
            <InputPopup
              x={popup.canvasX}
              y={popup.canvasY}
              onSubmit={handleAdd}
              onClose={() => setPopup(null)}
            />
          )}
        </div>

        {/* Title */}
        <div style={{
          position: "fixed", top: 24, left: 28, zIndex: 20,
          pointerEvents: "none",
          color: "rgba(180,195,255,0.4)",
          fontFamily: "'Outfit', sans-serif",
          fontSize: 12, fontWeight: 300, letterSpacing: "0.4em",
          textTransform: "uppercase", writingMode: "horizontal-tb",
        }}>
          Lawig
        </div>

        {/* Empty hint */}
        {objects.length === 0 && (
          <div style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            color: "rgba(180,195,255,0.18)",
            fontFamily: "'Outfit', sans-serif",
            fontSize: 15, fontWeight: 200, letterSpacing: "0.1em",
            writingMode: "horizontal-tb",
          }}>
            click anywhere to leave a thought
          </div>
        )}
      </div>

      {/* ── HUD overlay — completely outside the canvas div so touch events are isolated ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          pointerEvents: "none", // transparent by default; children opt-in
          writingMode: "horizontal-tb",
        }}
      >
        {/* ── COORDINATES HUD — bottom left ── */}
        <div
          onMouseDown={hudStop}
          onMouseUp={hudStop}
          onTouchStart={hudStop}
          onTouchMove={hudStop}
          onTouchEnd={hudStop}
          onPointerDown={hudStop}
          onPointerUp={hudStop}
          style={{
            position: "absolute",
            bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
            left: "calc(28px + env(safe-area-inset-left, 0px))",
            pointerEvents: "all",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          {/* Go To panel */}
          {showGoto && (
            <div
              style={{
                background: "rgba(7,8,15,0.92)",
                border: "1px solid rgba(180,195,255,0.15)",
                borderRadius: 6,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <div style={{
                color: "rgba(180,195,255,0.45)",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
              }}>
                go to coordinates
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  placeholder="x"
                  value={gotoInput.x}
                  onChange={(e) => setGotoInput((p) => ({ ...p, x: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleGoto();
                    if (e.key === "Escape") setShowGoto(false);
                  }}
                  style={{
                    width: 80,
                    background: "transparent", border: "none",
                    borderBottom: "1px solid rgba(180,195,255,0.25)",
                    color: "rgba(210,225,255,0.85)",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 14, padding: "4px 2px", outline: "none",
                    writingMode: "horizontal-tb",
                    touchAction: "manipulation",
                  }}
                />
                <input
                  type="number"
                  placeholder="y"
                  value={gotoInput.y}
                  onChange={(e) => setGotoInput((p) => ({ ...p, y: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleGoto();
                    if (e.key === "Escape") setShowGoto(false);
                  }}
                  style={{
                    width: 80,
                    background: "transparent", border: "none",
                    borderBottom: "1px solid rgba(180,195,255,0.25)",
                    color: "rgba(210,225,255,0.85)",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 14, padding: "4px 2px", outline: "none",
                    writingMode: "horizontal-tb",
                    touchAction: "manipulation",
                  }}
                />
                <button
                  onPointerUp={(e) => { e.stopPropagation(); handleGoto(); }}
                  onClick={(e) => { e.stopPropagation(); handleGoto(); }}
                  style={{
                    background: "transparent", border: "none",
                    color: "rgba(180,195,255,0.7)",
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13, cursor: "pointer",
                    padding: "0 6px", letterSpacing: "0.05em",
                    touchAction: "manipulation",
                  }}
                >
                  go ↗
                </button>
              </div>
              {gotoError && (
                <div style={{
                  color: "rgba(255,160,160,0.6)",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 11, letterSpacing: "0.08em",
                }}>
                  {gotoError}
                </div>
              )}
            </div>
          )}

          {/* Live coords + copy + goto toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              title="click to copy"
              onPointerUp={(e) => { e.stopPropagation(); copyCoords(); }}
              onClick={(e) => { e.stopPropagation(); copyCoords(); }}
              style={{
                color: "rgba(180,195,255,0.45)",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13, letterSpacing: "0.1em",
                cursor: "copy", transition: "color 0.2s", userSelect: "none",
                touchAction: "manipulation",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "rgba(180,195,255,0.75)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(180,195,255,0.45)"}
            >
              {centerX}, {centerY}
            </div>

            <div style={{ width: 1, height: 12, background: "rgba(180,195,255,0.15)" }} />

            <button
              onPointerUp={(e) => { e.stopPropagation(); setShowGoto((v) => !v); setGotoError(""); }}
              onClick={(e) => { e.stopPropagation(); setShowGoto((v) => !v); setGotoError(""); }}
              style={{
                background: "transparent", border: "none",
                color: showGoto ? "rgba(180,195,255,0.75)" : "rgba(180,195,255,0.45)",
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13, letterSpacing: "0.1em",
                cursor: "pointer", padding: 0, transition: "color 0.2s",
                touchAction: "manipulation",
              }}
            >
              go to
            </button>
          </div>
        </div>

        {/* ── Reset — bottom right ── */}
        <div
          onMouseDown={hudStop}
          onMouseUp={hudStop}
          onTouchStart={hudStop}
          onTouchMove={hudStop}
          onTouchEnd={hudStop}
          onPointerDown={hudStop}
          onPointerUp={hudStop}
          style={{
            position: "absolute",
            bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
            right: "calc(28px + env(safe-area-inset-right, 0px))",
            pointerEvents: "all",
          }}
        >
          <button
            onPointerUp={(e) => { e.stopPropagation(); resetView(); }}
            onClick={(e) => { e.stopPropagation(); resetView(); }}
            style={{
              background: "transparent",
              border: "1px solid rgba(180,195,255,0.18)",
              borderRadius: 3,
              color: "rgba(180,195,255,0.45)",
              fontFamily: "'Outfit', sans-serif",
              fontSize: 13, letterSpacing: "0.1em",
              padding: "6px 16px", cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            reset view
          </button>
        </div>
      </div>
    </>
  );
}