import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Lumina LMS",
  description: "MVP Learning Management System",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <header className="mb-8 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Lumina LMS</h1>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
