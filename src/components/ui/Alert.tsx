type Props = {
  type?: "success" | "error" | "info";
  message: string;
};

export default function Alert({ type = "info", message }: Props) {
  const colors = {
    success: "#2ecc71",
    error: "#e74c3c",
    info: "#3498db",
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        borderLeft: `5px solid ${colors[type]}`,
        padding: "12px",
        marginBottom: "15px",
        borderRadius: "6px",
      }}
    >
      <p style={{ margin: 0 }}>{message}</p>
    </div>
  );
}
