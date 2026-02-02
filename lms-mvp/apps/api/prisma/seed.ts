import { PrismaClient, Role, CourseStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const [admin, instructor, studentA, studentB] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@lumina.dev",
        passwordHash,
        role: Role.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        name: "Instructor User",
        email: "instructor@lumina.dev",
        passwordHash,
        role: Role.INSTRUCTOR,
      },
    }),
    prisma.user.create({
      data: {
        name: "Student One",
        email: "student1@lumina.dev",
        passwordHash,
        role: Role.STUDENT,
      },
    }),
    prisma.user.create({
      data: {
        name: "Student Two",
        email: "student2@lumina.dev",
        passwordHash,
        role: Role.STUDENT,
      },
    }),
  ]);

  const course = await prisma.course.create({
    data: {
      title: "Intro to Product Design",
      description: "Learn the fundamentals of product design workflows.",
      category: "Design",
      level: "Beginner",
      status: CourseStatus.PUBLISHED,
      instructorId: instructor.id,
      modules: {
        create: [
          {
            title: "Foundations",
            position: 1,
            lessons: {
              create: [
                { title: "Design Thinking", content: "Intro content", position: 1, isPublished: true },
                { title: "User Research", content: "Intro content", position: 2, isPublished: true },
              ],
            },
          },
          {
            title: "Execution",
            position: 2,
            lessons: {
              create: [{ title: "Wireframes", content: "Intro content", position: 1, isPublished: true }],
            },
            assignments: {
              create: [
                {
                  title: "Persona Assignment",
                  instructions: "Submit a persona draft.",
                  maxScore: 100,
                  isPublished: true,
                },
              ],
            },
          },
        ],
      },
    },
    include: { modules: true },
  });

  await prisma.enrollment.createMany({
    data: [
      { courseId: course.id, studentId: studentA.id },
      { courseId: course.id, studentId: studentB.id },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: admin.id,
        action: "USER_CREATED",
        entityType: "User",
        entityId: instructor.id,
        metadata: { via: "seed" },
      },
      {
        actorId: admin.id,
        action: "COURSE_PUBLISHED",
        entityType: "Course",
        entityId: course.id,
        metadata: { via: "seed" },
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
