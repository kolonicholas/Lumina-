"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function getRole() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/role=([^;]+)/);
  return match?.[1] ?? null;
}

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getRole());
  }, []);

  return (
    <main className="space-y-6">
      <section className="rounded bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">Welcome back! Role: {role ?? "Unknown"}</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {role === "ADMIN" && (
          <>
            <Link className="rounded border bg-white p-4" href="/admin/users">
              Manage users
            </Link>
            <Link className="rounded border bg-white p-4" href="/admin/courses">
              Manage courses
            </Link>
            <Link className="rounded border bg-white p-4" href="/admin/enrollments">
              Manage enrollments
            </Link>
          </>
        )}
        {role === "INSTRUCTOR" && (
          <>
            <Link className="rounded border bg-white p-4" href="/instructor/courses">
              My courses
            </Link>
          </>
        )}
        {role === "STUDENT" && (
          <>
            <Link className="rounded border bg-white p-4" href="/student/my-courses">
              My courses
            </Link>
            <Link className="rounded border bg-white p-4" href="/student/grades">
              Grades
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
