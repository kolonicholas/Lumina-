import type { Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { gradeSchema, submissionSchema } from "@lms/shared";
import { prisma } from "../utils/db.js";
import { ApiError } from "../utils/errors.js";
import type { AuthRequest } from "../middleware/auth.js";
import { logAudit } from "../utils/audit.js";

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg"];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new ApiError("Invalid file type", 400));
    }
    return cb(null, true);
  },
});

async function assertStudentEnrollment(userId: string, assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { module: { include: { course: true } } },
  });
  if (!assignment) {
    throw new ApiError("Assignment not found", 404);
  }
  const enrollment = await prisma.enrollment.findFirst({
    where: { studentId: userId, courseId: assignment.module.courseId, status: "ACTIVE" },
  });
  if (!enrollment) {
    throw new ApiError("Not enrolled", 403);
  }
  return assignment;
}

async function assertInstructorOrAdmin(userId: string, role: string, assignmentId: string) {
  if (role === "ADMIN") {
    return;
  }
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { module: { include: { course: true } } },
  });
  if (!assignment || assignment.module.course.instructorId !== userId) {
    throw new ApiError("Forbidden", 403);
  }
}

export async function createSubmission(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const data = submissionSchema.parse(req.body);
  const assignment = await assertStudentEnrollment(req.user?.id ?? "", id);
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const isLate = assignment.dueDate ? new Date() > assignment.dueDate : false;

  const submission = await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId: id, studentId: req.user?.id ?? "" } },
    create: {
      assignmentId: id,
      studentId: req.user?.id ?? "",
      textAnswer: data.textAnswer,
      fileUrl,
      isLate,
    },
    update: {
      textAnswer: data.textAnswer,
      fileUrl,
      isLate,
      submittedAt: new Date(),
    },
  });

  return res.status(201).json(submission);
}

export async function listSubmissions(req: AuthRequest, res: Response) {
  const { id } = req.params;
  await assertInstructorOrAdmin(req.user?.id ?? "", req.user?.role ?? "", id);
  const submissions = await prisma.submission.findMany({
    where: { assignmentId: id },
    include: { student: true, grade: true },
  });
  return res.json({ items: submissions });
}

export async function gradeSubmission(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const data = gradeSchema.parse(req.body);
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { assignment: { include: { module: { include: { course: true } } } } },
  });
  if (!submission) {
    throw new ApiError("Submission not found", 404);
  }
  await assertInstructorOrAdmin(req.user?.id ?? "", req.user?.role ?? "", submission.assignmentId);

  const grade = await prisma.grade.upsert({
    where: { submissionId: id },
    create: {
      submissionId: id,
      score: data.score,
      feedback: data.feedback,
      gradedBy: req.user?.id ?? "",
      isPublished: data.isPublished ?? false,
    },
    update: {
      score: data.score,
      feedback: data.feedback,
      gradedBy: req.user?.id ?? "",
      gradedAt: new Date(),
      isPublished: data.isPublished ?? false,
    },
  });

  if (data.isPublished) {
    await logAudit(req.user?.id ?? "", "GRADE_PUBLISHED", "Grade", grade.id, { submissionId: id });
  }

  return res.json(grade);
}

export async function listMyGrades(req: AuthRequest, res: Response) {
  const grades = await prisma.grade.findMany({
    where: { submission: { studentId: req.user?.id ?? "" }, isPublished: true },
    include: { submission: { include: { assignment: true } } },
  });
  return res.json({ items: grades });
}
