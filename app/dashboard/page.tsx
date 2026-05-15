import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch user's courses
  const courses = await prisma.course.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Convert dates to strings for serialization
  const serializedCourses = courses.map(course => ({
    ...course,
    createdAt: course.createdAt.toISOString(),
  }));

  // Fetch user's activities
  const activities = await prisma.activity.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const streakActivities = await prisma.activity.findMany({
    where: {
      userId: session.user.id,
      createdAt: {
        gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Convert dates to strings for serialization
  const serializedActivities = activities.map(activity => ({
    ...activity,
    createdAt: activity.createdAt.toISOString(),
  }));

  const dayKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const activityDaySet = new Set(
    streakActivities.map((activity) => dayKey(new Date(activity.createdAt)))
  );

  const currentDate = new Date();

  let currentStreak = 0;
  let cursor = new Date(currentDate);
  const startKeys = [dayKey(cursor), dayKey(new Date(Date.now() - 86400000))];

  for (const startKey of startKeys) {
    if (activityDaySet.has(startKey)) {
      currentStreak = 1;
      cursor = new Date(currentDate);
      cursor.setDate(cursor.getDate() - (startKey === startKeys[0] ? 1 : 2));

      while (activityDaySet.has(dayKey(cursor))) {
        currentStreak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }

      break;
    }
  }

  const longestStreak = (() => {
    const sortedDays = Array.from(activityDaySet).sort();
    let longest = 0;
    let current = 0;
    let previous = "";

    sortedDays.forEach((day) => {
      if (!previous) {
        current = 1;
      } else {
        const [year, month, dayOfMonth] = previous.split("-").map(Number);
        const previousDate = new Date(year, month - 1, dayOfMonth);
        previousDate.setDate(previousDate.getDate() + 1);
        if (day === dayKey(previousDate)) {
          current += 1;
        } else {
          current = 1;
        }
      }

      longest = Math.max(longest, current);
      previous = day;
    });

    return longest;
  })();

  // Get user preferences
  const preferences = await prisma.userPreferences.findUnique({
    where: { userId: session.user.id },
  });

  // Calculate stats
  const totalCourses = await prisma.course.count({
    where: { userId: session.user.id },
  });

  const savedCourses = await prisma.course.count({
    where: {
      userId: session.user.id,
      isSaved: true,
    },
  });

  // Calculate learning streak (days with activity in the last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentActivities = await prisma.activity.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: thirtyDaysAgo },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate streak by checking consecutive days with activity
  const activityDates = [...new Set(recentActivities.map(a => 
    new Date(a.createdAt).toDateString()
  ))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (activityDates.includes(today) || activityDates.includes(yesterday)) {
    streak = 1;
    let checkDate = new Date(today);
    
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const dateStr = checkDate.toDateString();
      if (activityDates.includes(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
  }

  // Calculate completion rate (assuming courses with activities are "in progress")
  const coursesWithActivity = await prisma.course.count({
    where: {
      userId: session.user.id,
      activities: { some: {} },
    },
  });

  const completionRate = totalCourses > 0 ? Math.round((coursesWithActivity / totalCourses) * 100) : 0;

  // Calculate average progress across all courses
  const totalProgress = courses.reduce((sum, course) => sum + course.progress, 0);
  const averageProgress = courses.length > 0 ? Math.round(totalProgress / courses.length) : 0;

  // Calculate courses completed this month
  const completedThisMonth = await prisma.course.count({
    where: {
      userId: session.user.id,
      isCompleted: true,
      completedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    },
  });

  // Calculate most active focus area
  const focusCounts = courses.reduce((acc, course) => {
    acc[course.focus] = (acc[course.focus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostActiveFocus = Object.entries(focusCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || "None";

  const recentActivity = activities.length > 0 ? activities[0] : null;

  return (
    <DashboardClient
      user={session.user}
      courses={serializedCourses}
      activities={serializedActivities}
      preferences={preferences}
      stats={{
        totalCourses,
        savedCourses,
        learningStreak: streak,
        currentStreak,
        longestStreak,
        activeDaysCount: activityDaySet.size,
        completionRate,
        averageProgress,
        completedThisMonth,
        mostActiveFocus,
        recentActivity: recentActivity?.createdAt?.toISOString() || null,
      }}
      activityDays={Array.from(activityDaySet)}
    />
  );
}