"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

export default function StudentCoursesPage() {
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
          <Link key={course.id} href={`/courses/${course.id}`} className="rounded bg-white p-4 shadow">
            {course.title}
          </Link>
        ))}
      </div>
    </main>
  );
}
