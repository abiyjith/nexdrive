export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        padding: "18px",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        marginBottom: "20px",
      }}
    >
      {children}
    </div>
  );
}
