# API Reference

All protected endpoints require an authenticated NextAuth session. In practice, the frontend uses the signed-in session cookie automatically.

## `POST /api/auth/signup`

Creates a new user account and initializes default preferences plus a first activity record.

Example request:

```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Demo Learner",
  "email": "demo@example.com",
  "password": "Password123!"
}
```

Example response:

```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_123",
    "name": "Demo Learner",
    "email": "demo@example.com"
  }
}
```

## `POST /api/assistant`

Returns an AI mentor reply and, when authenticated, stores the conversation server-side.

Example request:

```json
{
  "conversationId": "conv_123",
  "userName": "Demo Learner",
  "messages": [
    { "role": "user", "content": "How do I improve my streak?" }
  ]
}
```

Example response:

```json
{
  "reply": "Keep logging activity daily to grow your streak and active days.",
  "conversationId": "conv_123"
}
```

## `GET /api/courses`

Returns the current user’s saved courses.

Query parameters:

- `take` maximum number of courses to return, default `20`
- `skip` number of courses to skip, default `0`
- `saved` filter by saved state, `true` or `false`
- `completed` filter by completion state, `true` or `false`
- `focus` filter by exact focus string
- `level` filter by exact level string

Example response:

```json
[
  {
    "id": "course_123",
    "title": "Personalized AI Foundations Roadmap",
    "focus": "AI & Machine Learning",
    "level": "Beginner",
    "goals": "Understand the core ideas of AI.",
    "modules": [],
    "roadmap": [],
    "youtubeLinks": [],
    "recommendedCourses": [],
    "isSaved": true,
    "progress": 40,
    "isCompleted": false,
    "completedAt": null,
    "createdAt": "2026-05-09T10:00:00.000Z",
    "updatedAt": "2026-05-09T10:00:00.000Z"
  }
]
```

## `POST /api/courses`

Creates a saved course for the current user.

Example request:

```json
{
  "title": "React Roadmap",
  "focus": "Web Development",
  "level": "Intermediate",
  "goals": "Build better React apps",
  "modules": [{ "title": "Module 1" }],
  "roadmap": [{ "step": 1 }],
  "youtubeLinks": [],
  "recommendedCourses": []
}
```

## `GET /api/courses/[id]`

Returns a single course owned by the current user.

## `POST /api/courses/[id]/save`

Toggles the saved state of a course and creates a corresponding activity entry.

Example response:

```json
{
  "success": true,
  "isSaved": true
}
```

## `PATCH /api/courses/[id]/progress`

Updates course progress and marks it complete when progress reaches 100.

Example request:

```json
{
  "progress": 80,
  "isCompleted": false
  "progress": 80,
  "isCompleted": false,
  "completedAt": null
}
```

## `GET /api/activities`

Lists the current user’s activities.

Query parameters:

- `courseId` filter by course identifier
- `type` filter by activity type
- `take` maximum number of activities to return, default `50`
- `skip` number of activities to skip, default `0`

Example response:

```json
[
  {
    "id": "activity_123",
    "userId": "user_123",
    "courseId": "course_123",
    "type": "course_progress",
    "description": "Made progress on the seeded learning path",
    "metadata": { "progress": 40 },
    "createdAt": "2026-05-09T10:00:00.000Z"
  }
]

Example request:

```json
{
  "courseId": "course_123",
  "type": "course_progress",
  "description": "Made progress on a course",
  "metadata": { "progress": 60 }
}
```

## `GET /api/activities/[id]`

Returns one activity owned by the current user.

## `PATCH /api/activities/[id]`

Updates an activity’s `courseId`, `type`, `description`, or `metadata`.

## `DELETE /api/activities/[id]`
Example response:

```json
{ "success": true }
```
Returns the current user’s preferences or defaults if none exist.

Example response:

```json
{
  "id": "prefs_123",
  "userId": "user_123",
  "theme": "dark",
  "notifications": true,
  "defaultFocus": "AI & Machine Learning",
  "defaultLevel": "Intermediate",
  "createdAt": "2026-05-09T10:00:00.000Z",
  "updatedAt": "2026-05-09T10:00:00.000Z"
}
```

## `PUT /api/user/preferences`

Upserts the current user’s preferences.

Example request:

```json
{
  "theme": "dark",
  "notifications": true,
  "defaultFocus": "AI & Machine Learning",
  "defaultLevel": "Advanced"
}
```

## `POST /api/generate-course`

Generates a personalized course plan and saves it when the user is authenticated.
