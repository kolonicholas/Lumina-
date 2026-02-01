# Extensibility & Roadmap

## Modular Architecture Principles
- Separate modules for auth, courses, learning, assignments, and reporting.
- Clear service boundaries and API contracts.
- Shared domain model to prevent duplication.

## Future Extensions (Non-MVP)
- Payments and subscriptions.
- Certificates and credentialing.
- Live video classes.
- Messaging and announcements.
- Advanced assessments and quizzes.

## Scalability Notes
- Stateless application layer for horizontal scaling.
- Use a file storage service for uploaded materials.
- Optimize progress queries with precomputed aggregates where needed.
