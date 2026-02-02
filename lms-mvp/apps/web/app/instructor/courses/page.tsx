"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    apiFetch<{ items: Array<{ id: string; title: string }> }>("/courses").then((result) => {
      if (result.data) setCourses(result.data.items);
    });
  }, []);

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-semibold">My Courses</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <div key={course.id} className="rounded bg-white p-4 shadow">
            <h3 className="font-semibold">{course.title}</h3>
            <div className="mt-3 flex gap-2">
              <Link className="rounded border px-3 py-1 text-sm" href={`/instructor/courses/${course.id}/builder`}>
                Builder
              </Link>
              <Link className="rounded border px-3 py-1 text-sm" href={`/instructor/courses/${course.id}/submissions`}>
                Submissions
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
