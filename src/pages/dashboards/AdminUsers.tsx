import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Profile = {
  user_id: string;
  username: string;
  email: string;
  active_role: string;
  is_driver: boolean;
  is_owner: boolean;
};

function resolveRole(p: Profile) {
  if (p.active_role === "admin") return "admin";
  if (p.is_driver) return "driver";
  if (p.is_owner) return "owner";
  return "customer";
}

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, email, active_role, is_driver, is_owner");

    setUsers(data || []);
  }

  const filtered = users.filter((u) =>
    filter === "all" ? true : resolveRole(u) === filter
  );

  return (
    <div className="admin-page">
      <h2>Users</h2>

      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All Roles</option>
        <option value="customer">Customer</option>
        <option value="driver">Driver</option>
        <option value="owner">Owner</option>
        <option value="admin">Admin</option>
      </select>

      {filtered.map((u) => (
        <div key={u.user_id} className="card">
          <p><b>Username:</b> {u.username}</p>
          <p><b>Email:</b> {u.email}</p>
          <p><b>Role:</b> {resolveRole(u)}</p>
        </div>
      ))}
    </div>
  );
}