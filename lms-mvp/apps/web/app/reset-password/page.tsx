"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "../lib/api";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    const result = await apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
    if (!result.error) {
      setDone(true);
    }
  };

  return (
    <main className="mx-auto max-w-md rounded bg-white p-6 shadow">
      <h2 className="text-xl font-semibold">Reset password</h2>
      {done ? (
        <p className="mt-3 text-sm text-slate-600">Password updated. Please log in.</p>
      ) : (
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Reset token"
            value={token}
            readOnly
          />
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="New password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button className="w-full rounded bg-slate-900 py-2 text-sm text-white" onClick={submit}>
            Reset
          </button>
        </div>
      )}
    </main>
  );
}
