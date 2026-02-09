import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [role, setRole] = useState("");

  useEffect(() => {
    load();
  }, [role]);

  const load = async () => {
    let q = supabase.from("profiles").select("*");
    if (role) q = q.eq("role", role);
    const { data } = await q;
    setUsers(data || []);
  };

  return (
    <>
      <h2>Users</h2>

      <select onChange={e => setRole(e.target.value)}>
        <option value="">All</option>
        <option value="customer">Customer</option>
        <option value="driver">Driver</option>
        <option value="owner">Owner</option>
        <option value="admin">Admin</option>
      </select>

      {users.map(u => (
        <div key={u.user_id} className="profile-card">
          <p>{u.username}</p>
          <p>{u.email}</p>
          <p>Role: {u.role}</p>
        </div>
      ))}
    </>
  );
}