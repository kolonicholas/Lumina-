"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../lib/api";

type Course = { id: string; title: string; description: string };

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    apiFetch<{ items: Course[] }>("/courses").then((result) => {
      if (result.data) setCourses(result.data.items);
    });
  }, []);

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-semibold">Courses</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`} className="rounded bg-white p-4 shadow">
            <h3 className="font-semibold">{course.title}</h3>
            <p className="text-sm text-slate-600">{course.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
