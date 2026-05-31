import { Html } from "@react-three/drei";

export function NodeLabel({ id }: { id: string }) {
  return (
    <Html position={[0, -0.55, 0]} center style={{ pointerEvents: "none" }}>
      <span style={{
        fontFamily: "var(--font-mono), monospace",
        fontSize: 11, fontWeight: 700, textTransform: "uppercase",
        color: "#131a20", background: "rgba(255,255,255,0.85)",
        padding: "3px 7px", whiteSpace: "nowrap", borderRadius: 3,
      }}>
        {id}
      </span>
    </Html>
  );
}
