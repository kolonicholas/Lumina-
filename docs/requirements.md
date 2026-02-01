# MVP Requirements

## Functional Requirements
### Authentication & Roles
- Email + password login.
- Role-based access: Admin, Instructor, Student.
- Admin can assign roles and deactivate users.

### Course Management
- Create, edit, publish, unpublish courses.
- Course structure includes:
  - Title
  - Description
  - Modules/lessons
  - Learning materials (PDF upload, video links, text content)

### Enrollment
- Admin or instructor can enroll students.
- Students can view enrolled courses.
- Enrollment status: enrolled, completed.

### Learning Experience
- Students can:
  - View course materials.
  - Mark lessons completed.
  - Track progress at course level (percentage completed).

### Assignments & Submissions
- Instructors create assignments (title, instructions, due date).
- Students submit text or file uploads.
- Instructor can mark submissions as reviewed.

### Dashboards
- **Admin dashboard**: total users, total courses.
- **Instructor dashboard**: courses created, total enrolled students.
- **Student dashboard**: enrolled courses and progress per course.

## Non-Functional Requirements
- Mobile-friendly responsive design.
- Simple UI with clarity over aesthetics.
- Secure authentication (hashed passwords, session/token management).
- Fast load time under normal usage.
- Modular architecture to enable future extensions (payments, certificates, exams).
