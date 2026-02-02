"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

type Lesson = { id: string; title: string; position: number };

type Module = { id: string; title: string; lessons: Lesson[] };

type Course = { id: string; title: string; description: string; modules: Module[] };

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    apiFetch<Course>(`/courses/${params.id}`).then((result) => {
      if (result.data) setCourse(result.data);
    });
  }, [params.id]);

  if (!course) {
    return <p>Loading...</p>;
  }

  return (
    <main className="space-y-4">
      <div className="rounded bg-white p-6 shadow">
        <h2 className="text-xl font-semibold">{course.title}</h2>
        <p className="text-sm text-slate-600">{course.description}</p>
      </div>
      <div className="space-y-4">
        {course.modules.map((module) => (
          <div key={module.id} className="rounded bg-white p-4 shadow">
            <h3 className="font-semibold">{module.title}</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
              {module.lessons.map((lesson) => (
                <li key={lesson.id}>{lesson.title}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
