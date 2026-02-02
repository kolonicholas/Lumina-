"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role: string }>>([]);

  useEffect(() => {
    apiFetch<{ items: Array<{ id: string; name: string; email: string; role: string }> }>("/admin/users").then((result) => {
      if (result.data) setUsers(result.data.items);
    });
  }, []);

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-semibold">Users</h2>
      <div className="rounded bg-white p-4 shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
