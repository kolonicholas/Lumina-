# API Surface (Conceptual)

The API is designed to be modular and layered (auth, courses, learning, admin). It can be implemented in REST, GraphQL, or RPC without refactoring the core domain model.

## Authentication
- POST /auth/login
- POST /auth/logout
- POST /auth/password-reset

## Users (Admin)
- GET /admin/users
- POST /admin/users
- PATCH /admin/users/:id
- POST /admin/users/:id/role

## Courses (Instructor/Admin)
- GET /courses
- POST /courses
- GET /courses/:id
- PATCH /courses/:id
- POST /courses/:id/publish
- POST /courses/:id/unpublish

## Modules & Lessons
- POST /courses/:id/modules
- PATCH /modules/:id
- POST /modules/:id/lessons
- PATCH /lessons/:id

## Enrollment
- POST /courses/:id/enrollments
- GET /students/:id/enrollments

## Learning Progress
- POST /lessons/:id/complete
- GET /courses/:id/progress

## Assignments
- POST /courses/:id/assignments
- PATCH /assignments/:id
- POST /assignments/:id/submissions
- PATCH /submissions/:id/review

## Dashboards
- GET /dashboard/admin
- GET /dashboard/instructor
- GET /dashboard/student
