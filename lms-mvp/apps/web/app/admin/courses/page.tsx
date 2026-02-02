"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Array<{ id: string; title: string; status: string }>>([]);

  useEffect(() => {
    apiFetch<{ items: Array<{ id: string; title: string; status: string }> }>("/courses").then((result) => {
      if (result.data) setCourses(result.data.items);
    });
  }, []);

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-semibold">Courses</h2>
      <div className="rounded bg-white p-4 shadow">
        <ul className="space-y-2">
          {courses.map((course) => (
            <li key={course.id} className="flex items-center justify-between border-b pb-2">
              <span>{course.title}</span>
              <span className="text-xs uppercase text-slate-500">{course.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
