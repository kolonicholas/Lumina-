import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { errorHandler } from "./utils/errors.js";
import { requireAuth, requireRole } from "./middleware/auth.js";
import * as authController from "./controllers/auth.js";
import * as adminController from "./controllers/admin.js";
import * as courseController from "./controllers/courses.js";
import * as submissionController from "./controllers/submissions.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve("uploads")));

const authLimiter = rateLimit({ windowMs: 60_000, max: 20 });

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/auth/register", authLimiter, authController.register);
app.post("/auth/login", authLimiter, authController.login);
app.post("/auth/refresh", authController.refresh);
app.post("/auth/logout", authController.logout);
app.post("/auth/forgot-password", authLimiter, authController.forgotPassword);
app.post("/auth/reset-password", authLimiter, authController.resetPassword);

app.get("/admin/dashboard", requireAuth, requireRole(["ADMIN"]), adminController.dashboard);
app.post("/admin/users", requireAuth, requireRole(["ADMIN"]), adminController.createUser);
app.get("/admin/users", requireAuth, requireRole(["ADMIN"]), adminController.listUsers);
app.post("/admin/courses", requireAuth, requireRole(["ADMIN"]), adminController.createCourse);
app.patch("/admin/courses/:id", requireAuth, requireRole(["ADMIN"]), adminController.updateCourse);
app.post("/admin/enrollments", requireAuth, requireRole(["ADMIN"]), adminController.createEnrollment);

app.get("/courses", requireAuth, courseController.listCourses);
app.get("/courses/:id", requireAuth, courseController.getCourse);
app.post("/courses/:id/modules", requireAuth, requireRole(["ADMIN", "INSTRUCTOR"]), courseController.createModule);
app.post("/modules/:id/lessons", requireAuth, requireRole(["ADMIN", "INSTRUCTOR"]), courseController.createLesson);
app.post("/modules/:id/assignments", requireAuth, requireRole(["ADMIN", "INSTRUCTOR"]), courseController.createAssignment);
app.patch("/lessons/:id", requireAuth, requireRole(["ADMIN", "INSTRUCTOR"]), courseController.updateLesson);
app.patch("/assignments/:id", requireAuth, requireRole(["ADMIN", "INSTRUCTOR"]), courseController.updateAssignment);
app.post("/courses/:id/announcements", requireAuth, requireRole(["ADMIN", "INSTRUCTOR"]), courseController.createAnnouncement);
app.get("/courses/:id/announcements", requireAuth, courseController.listAnnouncements);

app.post(
  "/assignments/:id/submissions",
  requireAuth,
  requireRole(["STUDENT"]),
  submissionController.upload.single("file"),
  submissionController.createSubmission
);
app.get(
  "/assignments/:id/submissions",
  requireAuth,
  requireRole(["ADMIN", "INSTRUCTOR"]),
  submissionController.listSubmissions
);
app.post(
  "/submissions/:id/grade",
  requireAuth,
  requireRole(["ADMIN", "INSTRUCTOR"]),
  submissionController.gradeSubmission
);
app.get("/me/grades", requireAuth, requireRole(["STUDENT"]), submissionController.listMyGrades);

app.use(errorHandler);
