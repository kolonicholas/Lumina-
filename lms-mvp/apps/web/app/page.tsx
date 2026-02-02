import Link from "next/link";

export default function Home() {
  return (
    <main className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">Welcome to Lumina LMS</h2>
        <p className="mt-2 text-sm text-slate-600">
          Use the dashboard to manage courses, assignments, and enrollments.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/login" className="rounded bg-slate-900 px-4 py-2 text-sm text-white">
            Sign in
          </Link>
          <Link href="/dashboard" className="rounded border px-4 py-2 text-sm">
            Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
