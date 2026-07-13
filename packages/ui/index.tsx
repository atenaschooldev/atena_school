import React from "react";

export function Button({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: "8px 16px", borderRadius: "4px", border: "1px solid #ccc" }}>
      {children}
    </button>
  );
}
