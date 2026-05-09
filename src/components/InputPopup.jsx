import { useState, useEffect, useRef } from "react";

export default function InputPopup({ x, y, onSubmit, onClose }) {
  const [text, setText] = useState("");
  const ref = useRef(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const submit = () => {
    if (text.trim()) onSubmit(text.trim());
    else onClose();
  };

  const stopAll = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div
      onClick={stopAll}
      onMouseDown={stopAll}
      onMouseUp={stopAll}
      onTouchStart={stopAll}
      onTouchMove={stopAll}
      onTouchEnd={stopAll}
      onPointerDown={stopAll}
      onPointerUp={stopAll}
      onPointerMove={stopAll}
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        zIndex: 1000,
        writingMode: "horizontal-tb",
        direction: "ltr",
        touchAction: "none",
      }}
    >
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
          if (e.key === "Escape") onClose();
        }}
        placeholder="a thought..."
        rows={3}
        style={{
          background: "rgba(7,8,15,0.9)",
          border: "none",
          borderBottom: "1px solid rgba(180,195,255,0.2)",
          color: "rgba(210,225,255,0.85)",
          fontFamily: "'Outfit', sans-serif",
          fontSize: 15,
          fontWeight: 300,
          padding: "8px 4px",
          width: 220,
          resize: "none",
          outline: "none",
          letterSpacing: "0.02em",
          lineHeight: 1.65,
          writingMode: "horizontal-tb",
          direction: "ltr",
          touchAction: "manipulation",
        }}
      />
      <div style={{
        marginTop: 8,
        display: "flex",
        gap: 12,
        writingMode: "horizontal-tb",
        direction: "ltr",
      }}>
        <button
          onPointerDown={stopAll}
          onPointerUp={(e) => { e.stopPropagation(); e.preventDefault(); submit(); }}
          onClick={(e) => { e.stopPropagation(); submit(); }}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(180,195,255,0.55)",
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11,
            letterSpacing: "0.12em",
            cursor: "pointer",
            padding: "8px 0",
            writingMode: "horizontal-tb",
            touchAction: "manipulation",
          }}
        >
          place ↵
        </button>
        <button
          onPointerDown={stopAll}
          onPointerUp={(e) => { e.stopPropagation(); e.preventDefault(); onClose(); }}
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(180,195,255,0.22)",
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11,
            cursor: "pointer",
            padding: "8px 0",
            writingMode: "horizontal-tb",
            touchAction: "manipulation",
          }}
        >
          esc
        </button>
      </div>
    </div>
  );
}