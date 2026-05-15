import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authState = {
  session: { user: { id: "user-1", email: "demo@aicrafter.dev", name: "Demo Learner" } },
};

const prismaMock = {
  course: {
    findMany: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  activity: {
    findMany: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  userPreferences: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
};

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => Promise.resolve(authState.session)),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

async function loadRoutes() {
  return Promise.all([
    import("@/app/api/courses/route"),
    import("@/app/api/activities/route"),
    import("@/app/api/user/preferences/route"),
  ]);
}

beforeEach(() => {
  authState.session = { user: { id: "user-1", email: "demo@aicrafter.dev", name: "Demo Learner" } };
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("courses API", () => {
  it("lists courses for the current user", async () => {
    prismaMock.course.findMany.mockResolvedValue([
      {
        id: "course-1",
        userId: "user-1",
        title: "AI Basics",
        focus: "AI & Machine Learning",
        level: "Beginner",
        goals: "Learn the basics",
        modules: JSON.stringify([{ title: "Basics" }]),
        roadmap: JSON.stringify([{ step: 1 }]),
        youtubeLinks: JSON.stringify([]),
        recommendedCourses: JSON.stringify([]),
        isSaved: true,
        progress: 50,
        isCompleted: false,
        completedAt: null,
        createdAt: new Date("2026-05-09T10:00:00.000Z"),
        updatedAt: new Date("2026-05-09T10:00:00.000Z"),
      },
    ]);

    const [coursesRoute] = await loadRoutes();
    const response = await coursesRoute.GET(new Request("http://localhost/api/courses"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.courses).toHaveLength(1);
    expect(body.courses[0].title).toBe("AI Basics");
    expect(body.nextCursor).toBeNull();
    expect(prismaMock.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        take: 21,
      })
    );
  });

  it("applies pagination and filters to the course list", async () => {
    prismaMock.course.findMany.mockResolvedValue([]);

    const [coursesRoute] = await loadRoutes();
    const response = await coursesRoute.GET(
      new Request("http://localhost/api/courses?take=5&skip=10&saved=true&completed=false&focus=Web%20Development&level=Intermediate")
    );

    expect(response.status).toBe(200);
    expect(prismaMock.course.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 6,
        where: expect.objectContaining({
          userId: "user-1",
          isSaved: true,
          isCompleted: false,
          focus: "Web Development",
          level: "Intermediate",
        }),
      })
    );
  });

  it("creates a course for the current user", async () => {
    prismaMock.course.create.mockResolvedValue({
      id: "course-2",
      userId: "user-1",
      title: "React Roadmap",
      focus: "Web Development",
      level: "Intermediate",
      goals: "Build better React apps",
      modules: JSON.stringify([{ title: "Module 1" }]),
      roadmap: JSON.stringify([{ step: 1 }]),
      youtubeLinks: JSON.stringify([]),
      recommendedCourses: JSON.stringify([]),
      isSaved: false,
      progress: 0,
      isCompleted: false,
      completedAt: null,
      createdAt: new Date("2026-05-09T10:00:00.000Z"),
      updatedAt: new Date("2026-05-09T10:00:00.000Z"),
    });

    const [coursesRoute] = await loadRoutes();
    const request = new Request("http://localhost/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "React Roadmap",
        focus: "Web Development",
        level: "Intermediate",
        goals: "Build better React apps",
        modules: [{ title: "Module 1" }],
        roadmap: [{ step: 1 }],
        youtubeLinks: [],
        recommendedCourses: [],
      }),
    });

    const response = await coursesRoute.POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.title).toBe("React Roadmap");
    expect(prismaMock.course.create).toHaveBeenCalled();
  });

  it("rejects empty course fields", async () => {
    const [coursesRoute] = await loadRoutes();
    const request = new Request("http://localhost/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "   ",
        focus: "Web Development",
        level: "Intermediate",
        goals: "Build better React apps",
        modules: [],
        roadmap: [],
        youtubeLinks: [],
        recommendedCourses: [],
      }),
    });

    const response = await coursesRoute.POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("Course fields cannot be empty");
    expect(prismaMock.course.create).not.toHaveBeenCalled();
  });
});

describe("activities API", () => {
  it("lists paginated activities", async () => {
    prismaMock.activity.findMany.mockResolvedValue([]);

    const [, activitiesRoute] = await loadRoutes();
    const response = await activitiesRoute.GET(
      new Request("http://localhost/api/activities?take=10&skip=3&type=course_progress")
    );

    expect(response.status).toBe(200);
    expect(prismaMock.activity.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 11,
        where: expect.objectContaining({
          userId: "user-1",
          type: "course_progress",
        }),
      })
    );
  });

  it("creates an activity and returns parsed metadata", async () => {
    prismaMock.activity.create.mockResolvedValue({
      id: "activity-1",
      userId: "user-1",
      courseId: "course-1",
      type: "course_progress",
      description: "Made progress on a course",
      metadata: JSON.stringify({ progress: 60 }),
      createdAt: new Date("2026-05-09T10:00:00.000Z"),
    });

    const [, activitiesRoute] = await loadRoutes();
    prismaMock.course.findFirst.mockResolvedValue({ id: "course-1", userId: "user-1" });

    const request = new Request("http://localhost/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: "course-1",
        type: "course_progress",
        description: "Made progress on a course",
        metadata: { progress: 60 },
      }),
    });

    const response = await activitiesRoute.POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.metadata).toEqual({ progress: 60 });
    expect(prismaMock.activity.create).toHaveBeenCalled();
  });
});

describe("preferences API", () => {
  it("returns default preferences when none exist", async () => {
    prismaMock.userPreferences.findUnique.mockResolvedValue(null);

    const [, , preferencesRoute] = await loadRoutes();
    const response = await preferencesRoute.GET(new Request("http://localhost/api/user/preferences"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.theme).toBe("light");
    expect(body.defaultLevel).toBe("Beginner");
  });

  it("normalizes invalid preference values", async () => {
    prismaMock.userPreferences.upsert.mockResolvedValue({
      id: "prefs-1",
      userId: "user-1",
      theme: "light",
      notifications: true,
      defaultFocus: "",
      defaultLevel: "Beginner",
      createdAt: new Date("2026-05-09T10:00:00.000Z"),
      updatedAt: new Date("2026-05-09T10:00:00.000Z"),
    });

    const [, , preferencesRoute] = await loadRoutes();
    const request = new Request("http://localhost/api/user/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        theme: "neon",
        notifications: "yes",
        defaultFocus: 123,
        defaultLevel: "",
      }),
    });

    const response = await preferencesRoute.PUT(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.theme).toBe("light");
    expect(body.defaultLevel).toBe("Beginner");
  });

  it("upserts normalized preferences", async () => {
    prismaMock.userPreferences.upsert.mockResolvedValue({
      id: "prefs-1",
      userId: "user-1",
      theme: "dark",
      notifications: false,
      defaultFocus: "AI & Machine Learning",
      defaultLevel: "Advanced",
      createdAt: new Date("2026-05-09T10:00:00.000Z"),
      updatedAt: new Date("2026-05-09T10:00:00.000Z"),
    });

    const [, , preferencesRoute] = await loadRoutes();
    const request = new Request("http://localhost/api/user/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        theme: "dark",
        notifications: false,
        defaultFocus: "AI & Machine Learning",
        defaultLevel: "Advanced",
      }),
    });

    const response = await preferencesRoute.PUT(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.theme).toBe("dark");
    expect(prismaMock.userPreferences.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1" },
        update: expect.objectContaining({ theme: "dark" }),
        create: expect.objectContaining({ userId: "user-1" }),
      })
    );
  });
});
