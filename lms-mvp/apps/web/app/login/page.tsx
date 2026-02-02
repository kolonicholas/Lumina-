"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@lms/shared";
import type { z } from "zod";
import { apiFetch } from "../lib/api";
import { useRouter } from "next/navigation";

type FormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: FormValues) => {
    const result = await apiFetch<{ accessToken: string; user: { role: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(values),
    });
    if (result.data) {
      window.localStorage.setItem("accessToken", result.data.accessToken);
      document.cookie = `role=${result.data.user.role}; path=/`;
      router.push("/dashboard");
    } else {
      alert(result.error ?? "Login failed");
    }
  };

  return (
    <main className="mx-auto max-w-md rounded-lg bg-white p-6 shadow">
      <h2 className="text-xl font-semibold">Sign in</h2>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input className="mt-1 w-full rounded border px-3 py-2" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input className="mt-1 w-full rounded border px-3 py-2" type="password" {...register("password")} />
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </div>
        <button disabled={isSubmitting} className="w-full rounded bg-slate-900 py-2 text-sm text-white">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
