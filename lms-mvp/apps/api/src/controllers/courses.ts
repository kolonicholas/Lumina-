import type { Request, Response } from "express";
import { announcementSchema, createAssignmentSchema, createLessonSchema, createModuleSchema } from "@lms/shared";
import { prisma } from "../utils/db.js";
import { ApiError } from "../utils/errors.js";
import type { AuthRequest } from "../middleware/auth.js";

async function assertCourseInstructorOrAdmin(userId: string, role: string, courseId: string) {
  if (role === "ADMIN") {
    return;
  }
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || course.instructorId !== userId) {
    throw new ApiError("Forbidden", 403);
  }
}

async function assertStudentEnrollment(userId: string, courseId: string) {
  const enrollment = await prisma.enrollment.findFirst({ where: { studentId: userId, courseId, status: "ACTIVE" } });
  if (!enrollment) {
    throw new ApiError("Not enrolled", 403);
  }
}

export async function listCourses(req: AuthRequest, res: Response) {
  const { page = "1" } = req.query as Record<string, string>;
  const pageNumber = Number(page) || 1;
  const pageSize = 10;
  const role = req.user?.role;
  const userId = req.user?.id;

  if (!role || !userId) {
    throw new ApiError("Unauthorized", 401);
  }

  let where: Record<string, unknown> = {};
  if (role === "INSTRUCTOR") {
    where = { instructorId: userId };
  } else if (role === "STUDENT") {
    where = {
      status: "PUBLISHED",
      enrollments: { some: { studentId: userId, status: "ACTIVE" } },
    };
  }

  const [items, total] = await Promise.all([
    prisma.course.findMany({ where, skip: (pageNumber - 1) * pageSize, take: pageSize, orderBy: { createdAt: "desc" } }),
    prisma.course.count({ where }),
  ]);

  return res.json({ items, total, page: pageNumber, pageSize });
}

export async function getCourse(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const role = req.user?.role;
  const userId = req.user?.id;
  if (!role || !userId) {
    throw new ApiError("Unauthorized", 401);
  }

  if (role === "STUDENT") {
    await assertStudentEnrollment(userId, id);
  }
  if (role === "INSTRUCTOR") {
    await assertCourseInstructorOrAdmin(userId, role, id);
  }

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        include: { lessons: true, assignments: true },
        orderBy: { position: "asc" },
      },
      announcements: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!course) {
    throw new ApiError("Course not found", 404);
  }
  return res.json(course);
}

export async function createModule(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const data = createModuleSchema.parse(req.body);
  await assertCourseInstructorOrAdmin(req.user?.id ?? "", req.user?.role ?? "", id);
  const module = await prisma.module.create({
    data: {
      courseId: id,
      title: data.title,
      position: data.position,
    },
  });
  return res.status(201).json(module);
}

export async function createLesson(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const data = createLessonSchema.parse(req.body);
  const module = await prisma.module.findUnique({ where: { id } });
  if (!module) {
    throw new ApiError("Module not found", 404);
  }
  await assertCourseInstructorOrAdmin(req.user?.id ?? "", req.user?.role ?? "", module.courseId);
  const lesson = await prisma.lesson.create({
    data: {
      moduleId: id,
      title: data.title,
      content: data.content,
      position: data.position,
      isPublished: data.isPublished ?? false,
    },
  });
  return res.status(201).json(lesson);
}

export async function createAssignment(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const data = createAssignmentSchema.parse(req.body);
  const module = await prisma.module.findUnique({ where: { id } });
  if (!module) {
    throw new ApiError("Module not found", 404);
  }
  await assertCourseInstructorOrAdmin(req.user?.id ?? "", req.user?.role ?? "", module.courseId);
  const assignment = await prisma.assignment.create({
    data: {
      moduleId: id,
      title: data.title,
      instructions: data.instructions,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      maxScore: data.maxScore,
      isPublished: data.isPublished ?? false,
    },
  });
  return res.status(201).json(assignment);
}

export async function updateLesson(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { isPublished, position } = req.body as { isPublished?: boolean; position?: number };
  const lesson = await prisma.lesson.findUnique({ where: { id }, include: { module: true } });
  if (!lesson) {
    throw new ApiError("Lesson not found", 404);
  }
  await assertCourseInstructorOrAdmin(req.user?.id ?? "", req.user?.role ?? "", lesson.module.courseId);
  const updated = await prisma.lesson.update({ where: { id }, data: { isPublished, position } });
  return res.json(updated);
}

export async function updateAssignment(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { isPublished } = req.body as { isPublished?: boolean };
  const assignment = await prisma.assignment.findUnique({ where: { id }, include: { module: true } });
  if (!assignment) {
    throw new ApiError("Assignment not found", 404);
  }
  await assertCourseInstructorOrAdmin(req.user?.id ?? "", req.user?.role ?? "", assignment.module.courseId);
  const updated = await prisma.assignment.update({ where: { id }, data: { isPublished } });
  return res.json(updated);
}

export async function createAnnouncement(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const data = announcementSchema.parse(req.body);
  await assertCourseInstructorOrAdmin(req.user?.id ?? "", req.user?.role ?? "", id);
  const announcement = await prisma.announcement.create({
    data: {
      courseId: id,
      title: data.title,
      message: data.message,
      createdBy: req.user?.id ?? "",
    },
  });
  return res.status(201).json(announcement);
}

export async function listAnnouncements(req: AuthRequest, res: Response) {
  const { id } = req.params;
  if (req.user?.role === "STUDENT") {
    await assertStudentEnrollment(req.user.id, id);
  }
  const announcements = await prisma.announcement.findMany({
    where: { courseId: id },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ items: announcements });
}
