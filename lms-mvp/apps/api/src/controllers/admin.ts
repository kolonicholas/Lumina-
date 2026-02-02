import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { createCourseSchema, createEnrollmentSchema, createUserSchema } from "@lms/shared";
import { prisma } from "../utils/db.js";
import { ApiError } from "../utils/errors.js";
import { logAudit } from "../utils/audit.js";
import type { AuthRequest } from "../middleware/auth.js";

export async function dashboard(_req: Request, res: Response) {
  const [totalUsers, totalCourses, totalEnrollments, totalSubmissions] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.submission.count(),
  ]);
  return res.json({ totalUsers, totalCourses, totalEnrollments, totalSubmissions });
}

export async function createUser(req: AuthRequest, res: Response) {
  const data = createUserSchema.parse(req.body);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new ApiError("Email already exists", 400);
  }
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
    },
  });
  await logAudit(req.user?.id ?? user.id, "USER_CREATED", "User", user.id, { role: user.role });
  return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
}

export async function listUsers(req: Request, res: Response) {
  const { role, q = "", page = "1" } = req.query as Record<string, string>;
  const pageNumber = Number(page) || 1;
  const pageSize = 10;
  const where = {
    ...(role ? { role } : {}),
    ...(q ? { email: { contains: q, mode: "insensitive" } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, skip: (pageNumber - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    prisma.user.count({ where }),
  ]);
  return res.json({ items, total, page: pageNumber, pageSize });
}

export async function createCourse(req: AuthRequest, res: Response) {
  const data = createCourseSchema.parse(req.body);
  const course = await prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      level: data.level,
      instructorId: data.instructorId,
    },
  });
  return res.status(201).json(course);
}

export async function updateCourse(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { instructorId, status } = req.body as { instructorId?: string; status?: string };
  const course = await prisma.course.update({
    where: { id },
    data: {
      instructorId,
      status,
    },
  });
  if (status === "PUBLISHED") {
    await logAudit(req.user?.id ?? "unknown", "COURSE_PUBLISHED", "Course", id, { status });
  }
  return res.json(course);
}

export async function createEnrollment(req: AuthRequest, res: Response) {
  const data = createEnrollmentSchema.parse(req.body);
  const student = await prisma.user.findUnique({ where: { id: data.studentId } });
  if (!student || student.role !== "STUDENT") {
    throw new ApiError("Student not found", 404);
  }
  const enrollment = await prisma.enrollment.create({ data });
  await logAudit(req.user?.id ?? "unknown", "ENROLLMENT_CREATED", "Enrollment", enrollment.id, { courseId: data.courseId });
  return res.status(201).json(enrollment);
}
