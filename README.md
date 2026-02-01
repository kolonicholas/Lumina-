# Lumina LMS MVP

This repository defines a technology-agnostic MVP Learning Management System (LMS) focused on core teaching and learning workflows. It is intentionally minimal, modular, and designed for future extension.

## MVP Goals
- Enable instructors to create and manage courses.
- Allow students to enroll, access content, and submit assignments.
- Allow admins to manage users and courses.
- Track basic learning progress.

## Target Roles
- **Admin**: user and course management, high-level metrics.
- **Instructor**: course creation, enrollment management, assignments review.
- **Student**: learning, submissions, progress tracking.

## Scope Guardrails
**Out of scope**: live classes, certificates, payments, chat, advanced exams, AI recommendations.

## Documentation Map
- [Product requirements](docs/requirements.md)
- [Domain model](docs/data-model.md)
- [API surface](docs/api.md)
- [UI/UX flows](docs/ui.md)
- [Extensibility & roadmap](docs/roadmap.md)

## Success Criteria
- Instructor can create a course in < 5 minutes.
- Student can enroll and start learning immediately.
- Admin can manage users without technical knowledge.
- System supports 100 concurrent users.
