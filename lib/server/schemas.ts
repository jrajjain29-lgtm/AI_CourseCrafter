import { z } from "zod";

const serializedValueSchema = z.union([
  z.string(),
  z.array(z.record(z.string(), z.unknown())),
  z.record(z.string(), z.unknown()),
]);

export const courseListQuerySchema = z.object({
  take: z.coerce.number().int().positive().max(100).default(20),
  cursor: z.string().min(1).optional(),
  skip: z.coerce.number().int().min(0).default(0),
  saved: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  completed: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  focus: z.string().trim().min(1).optional(),
  level: z.string().trim().min(1).optional(),
});

export const courseCreateSchema = z.object({
  title: z.string().trim().min(1),
  focus: z.string().trim().min(1),
  level: z.string().trim().min(1),
  goals: z.string().trim().min(1),
  modules: serializedValueSchema.optional(),
  roadmap: serializedValueSchema.optional(),
  youtubeLinks: serializedValueSchema.optional(),
  recommendedCourses: serializedValueSchema.optional(),
  isSaved: z.boolean().optional(),
  progress: z.coerce.number().int().min(0).max(100).optional(),
  isCompleted: z.boolean().optional(),
  completedAt: z.string().datetime().nullable().optional(),
});

export const activityListQuerySchema = z.object({
  take: z.coerce.number().int().positive().max(100).default(50),
  cursor: z.string().min(1).optional(),
  skip: z.coerce.number().int().min(0).default(0),
  courseId: z.string().trim().min(1).optional(),
  type: z.string().trim().min(1).optional(),
});

export const activityCreateSchema = z.object({
  courseId: z.string().trim().min(1).nullable().optional(),
  type: z.string().trim().min(1),
  description: z.string().trim().min(1),
  metadata: z.unknown().optional(),
});

export const activityUpdateSchema = z.object({
  courseId: z.string().trim().min(1).nullable().optional(),
  type: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  metadata: z.unknown().optional(),
});

export const preferencesUpdateSchema = z.object({
  theme: z.unknown().optional(),
  notifications: z.unknown().optional(),
  defaultFocus: z.unknown().optional(),
  defaultLevel: z.unknown().optional(),
});

export const assistantRequestSchema = z.object({
  conversationId: z.string().trim().min(1).optional(),
  userName: z.string().trim().min(1).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string().trim(),
      })
    )
    .default([]),
});

export const generateCourseSchema = z.object({
  name: z.string().trim().min(1),
  focus: z.string().trim().min(1),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  goals: z.string().trim().min(1),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(6),
});

export const courseProgressSchema = z.object({
  progress: z.coerce.number().int().min(0).max(100).optional(),
  isCompleted: z.boolean().optional(),
});
