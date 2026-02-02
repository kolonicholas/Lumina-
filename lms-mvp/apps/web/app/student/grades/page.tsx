"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

type Grade = { id: string; score: number; feedback: string; submission: { assignment: { title: string } } };

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    apiFetch<{ items: Grade[] }>("/me/grades").then((result) => {
      if (result.data) setGrades(result.data.items);
    });
  }, []);

  return (
    <main className="space-y-4">
      <h2 className="text-xl font-semibold">Grades</h2>
      <div className="rounded bg-white p-4 shadow">
        {grades.length === 0 ? (
          <p className="text-sm text-slate-600">No published grades yet.</p>
        ) : (
          <ul className="space-y-2">
            {grades.map((grade) => (
              <li key={grade.id} className="border-b pb-2">
                <p className="font-medium">{grade.submission.assignment.title}</p>
                <p className="text-sm text-slate-600">Score: {grade.score}</p>
                <p className="text-sm text-slate-600">Feedback: {grade.feedback}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
