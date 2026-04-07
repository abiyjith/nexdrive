import { createContext, useContext, useState } from "react";

type Role = "customer" | "owner" | "driver" | "admin";

const RoleContext = createContext<{
  role: Role;
  setRole: (r: Role) => void;
}>({
  role: "customer",
  setRole: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>(() => {
    return (localStorage.getItem("active_role") as Role) || "customer";
  });

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
