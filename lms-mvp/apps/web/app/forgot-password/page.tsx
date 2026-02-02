"use client";

import { useState } from "react";
import { apiFetch } from "../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const result = await apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    if (!result.error) {
      setSent(true);
    }
  };

  return (
    <main className="mx-auto max-w-md rounded bg-white p-6 shadow">
      <h2 className="text-xl font-semibold">Forgot password</h2>
      {sent ? (
        <p className="mt-3 text-sm text-slate-600">Check the API console for your reset token.</p>
      ) : (
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button className="w-full rounded bg-slate-900 py-2 text-sm text-white" onClick={submit}>
            Send reset
          </button>
        </div>
      )}
    </main>
  );
}
