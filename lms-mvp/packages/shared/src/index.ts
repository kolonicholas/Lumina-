import { z } from "zod";

export const Roles = ["ADMIN", "INSTRUCTOR", "STUDENT"] as const;
export const AccountStatuses = ["ACTIVE", "SUSPENDED"] as const;
export const CourseStatuses = ["DRAFT", "PUBLISHED"] as const;
export const EnrollmentStatuses = ["ACTIVE", "REMOVED"] as const;
export const SubmissionStatuses = ["SUBMITTED", "MISSING"] as const;

export type Role = (typeof Roles)[number];
export type AccountStatus = (typeof AccountStatuses)[number];
export type CourseStatus = (typeof CourseStatuses)[number];
export type EnrollmentStatus = (typeof EnrollmentStatuses)[number];
export type SubmissionStatus = (typeof SubmissionStatuses)[number];

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(Roles),
});

export const createCourseSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  category: z.string().min(2),
  level: z.string().min(2),
  instructorId: z.string().uuid().optional(),
});

export const createModuleSchema = z.object({
  title: z.string().min(2),
  position: z.number().int().nonnegative(),
});

export const createLessonSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(5),
  position: z.number().int().nonnegative(),
  isPublished: z.boolean().optional(),
});

export const createAssignmentSchema = z.object({
  title: z.string().min(2),
  instructions: z.string().min(5),
  dueDate: z.string().datetime().optional(),
  maxScore: z.number().int().nonnegative(),
  isPublished: z.boolean().optional(),
});

export const createEnrollmentSchema = z.object({
  courseId: z.string().uuid(),
  studentId: z.string().uuid(),
});

export const announcementSchema = z.object({
  title: z.string().min(2),
  message: z.string().min(5),
});

export const gradeSchema = z.object({
  score: z.number().int().nonnegative(),
  feedback: z.string().min(2),
  isPublished: z.boolean().optional(),
});

export const submissionSchema = z.object({
  textAnswer: z.string().min(2).optional(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});
