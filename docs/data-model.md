# Domain Model (Technology-Agnostic)

## Core Entities
### User
- id
- name
- email
- role (admin | instructor | student)
- status (active | inactive)
- created_at

### Course
- id
- title
- description
- status (draft | published | archived)
- instructor_id
- created_at
- updated_at

### Module
- id
- course_id
- title
- order_index

### Lesson
- id
- module_id
- title
- content_type (text | pdf | video_link)
- content_ref (text blob or URL or file reference)
- order_index

### Enrollment
- id
- course_id
- student_id
- status (enrolled | completed)
- enrolled_at
- completed_at

### LessonProgress
- id
- lesson_id
- student_id
- completed_at

### Assignment
- id
- course_id
- title
- instructions
- due_date
- created_at

### Submission
- id
- assignment_id
- student_id
- submission_type (text | file)
- submission_ref (text blob or file reference)
- status (submitted | reviewed)
- submitted_at
- reviewed_at

## Derived Metrics
- Course progress = completed lessons / total lessons.
- Instructor dashboard metrics = count(courses) + count(enrollments in instructor courses).
- Admin dashboard metrics = total users + total courses.
