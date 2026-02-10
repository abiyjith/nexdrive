type Props = {
  onClick?: () => void;
  children: React.ReactNode;
  danger?: boolean;
};

export default function Button({ onClick, children, danger }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        background: danger ? "#e74c3c" : "#f1c40f",
        color: "#000",
        border: "none",
        padding: "8px 14px",
        borderRadius: "6px",
        cursor: "pointer",
        marginRight: "8px",
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}