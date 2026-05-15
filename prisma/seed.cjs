const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Password123!", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@aicrafter.dev" },
    update: {
      name: "Demo Learner",
      password: hashedPassword,
    },
    create: {
      name: "Demo Learner",
      email: "demo@aicrafter.dev",
      password: hashedPassword,
    },
  });

  await prisma.course.deleteMany({ where: { userId: user.id } });
  await prisma.activity.deleteMany({ where: { userId: user.id } });
  await prisma.userPreferences.deleteMany({ where: { userId: user.id } });
  await prisma.assistantConversation.deleteMany({ where: { userId: user.id } });

  const preferences = await prisma.userPreferences.create({
    data: {
      userId: user.id,
      theme: "dark",
      notifications: true,
      defaultFocus: "AI & Machine Learning",
      defaultLevel: "Intermediate",
    },
  });

  const course = await prisma.course.create({
    data: {
      userId: user.id,
      title: "Personalized AI Foundations Roadmap",
      focus: "AI & Machine Learning",
      level: "Beginner",
      goals: "Understand the core ideas of AI and build small practical projects.",
      modules: JSON.stringify([
        { title: "AI Basics", description: "Learn the foundations of machine learning.", duration: "2 weeks" },
        { title: "Hands-on Practice", description: "Build beginner-friendly projects.", duration: "3 weeks" },
      ]),
      roadmap: JSON.stringify([
        { step: 1, title: "Start", action: "Learn the foundations" },
        { step: 2, title: "Practice", action: "Work on projects" },
      ]),
      youtubeLinks: JSON.stringify([
        { title: "Andrew Ng - Machine Learning", url: "https://www.youtube.com/watch?v=UzxYlbK2c7E" },
      ]),
      recommendedCourses: JSON.stringify([
        { title: "Machine Learning by Andrew Ng", provider: "Coursera", url: "https://www.coursera.org/learn/machine-learning" },
      ]),
      isSaved: true,
      progress: 40,
      isCompleted: false,
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        userId: user.id,
        courseId: course.id,
        type: "course_generated",
        description: "Generated a personalized AI & Machine Learning course",
        metadata: JSON.stringify({ source: "seed" }),
      },
      {
        userId: user.id,
        courseId: course.id,
        type: "course_progress",
        description: "Made progress on the seeded learning path",
        metadata: JSON.stringify({ progress: 40 }),
      },
      {
        userId: user.id,
        type: "profile_updated",
        description: "Updated learning preferences",
        metadata: JSON.stringify({ theme: preferences.theme }),
      },
    ],
  });

  await prisma.assistantConversation.create({
    data: {
      userId: user.id,
      title: "How do I get started?",
      messages: JSON.stringify([
        { role: "user", content: "How do I get started with AI?" },
        { role: "assistant", content: "Start with fundamentals, then build small projects." },
      ]),
    },
  });

  console.log(`Seeded demo user ${user.email} with 1 course and starter activity.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
