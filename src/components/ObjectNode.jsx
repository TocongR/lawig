import { useState, useEffect } from "react";

export default function ObjectNode({ obj }) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        left: obj.x,
        top: obj.y,
        transform: "translate(-50%, -50%)",
        opacity: visible ? 1 : 0,
        cursor: "default",
        userSelect: "none",

        display: "block",
        width: "max-content",
        maxWidth: "240px",
        minWidth: "40px",

        writingMode: "horizontal-tb",
        direction: "ltr",
        textOrientation: "mixed",
        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "break-word",
        textAlign: "left",

        color: hovered
          ? "rgba(255,255,255,0.95)"
          : "rgba(200,215,255,0.75)",
        fontFamily: "'Outfit', sans-serif",
        fontSize: "15px",
        fontWeight: 300,
        lineHeight: 1.65,
        letterSpacing: "0.01em",
        textShadow: hovered
          ? "0 0 20px rgba(160,185,255,0.8), 0 0 50px rgba(120,150,255,0.4)"
          : "0 0 12px rgba(140,165,255,0.3)",
        transition: "opacity 0.8s ease, color 0.3s ease, text-shadow 0.3s ease",
      }}
    >
      {obj.text}
    </div>
  );
}