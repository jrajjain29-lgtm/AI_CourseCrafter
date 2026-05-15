import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  enforceRateLimit,
  finishApiRequest,
  getRateLimitKey,
  getRequestIp,
  jsonError,
  jsonResponse,
  logApiError,
  readJsonBody,
  startApiRequest,
} from "@/lib/server/api";
import { generateCourseSchema } from "@/lib/server/schemas";
import { ZodError } from "zod";

type CourseModule = {
  title: string;
  description: string;
  duration: string;
};

type RoadmapStep = {
  step: number;
  title: string;
  action: string;
};

type YoutubeLink = {
  title: string;
  url: string;
};

type RecommendedCourse = {
  title: string;
  provider: string;
  url: string;
};

type GenerateCourseBody = {
  name: string;
  focus: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  goals: string;
};

const suggestionsByFocus: Record<string, { youtube: YoutubeLink[]; courses: RecommendedCourse[] }> = {
  "ai & machine learning": {
    youtube: [
      { title: "Andrew Ng - Machine Learning (Stanford)", url: "https://www.youtube.com/watch?v=UzxYlbK2c7E" },
      { title: "3Blue1Brown - Neural Networks", url: "https://www.youtube.com/watch?v=aircAruvnKk" },
      { title: "Sentdex - AI Project Tutorials", url: "https://www.youtube.com/@sentdex" },
    ],
    courses: [
      { title: "Machine Learning by Andrew Ng", provider: "Coursera", url: "https://www.coursera.org/learn/machine-learning" },
      { title: "Deep Learning Specialization", provider: "Coursera", url: "https://www.coursera.org/specializations/deep-learning" },
      { title: "Practical Deep Learning for Coders", provider: "Fast.ai", url: "https://course.fast.ai/" },
    ],
  },
  "web development": {
    youtube: [
      { title: "Traversy Media - Full Stack Tutorials", url: "https://www.youtube.com/@TraversyMedia" },
      { title: "Coder Coder - React Projects", url: "https://www.youtube.com/@CoderCoder" },
      { title: "DesignCourse - UI/UX and Web", url: "https://www.youtube.com/@DesignCourse" },
    ],
    courses: [
      { title: "The Web Developer Bootcamp", provider: "Udemy", url: "https://www.udemy.com/course/the-web-developer-bootcamp/" },
      { title: "Front-End Web Developer", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-fundamentals-of-digital-marketing-and-e-commerce" },
      { title: "Modern React with Redux", provider: "Udemy", url: "https://www.udemy.com/course/react-redux/" },
    ],
  },
  "data science": {
    youtube: [
      { title: "Ken Jee - Data Science Career", url: "https://www.youtube.com/@KenJee_DS" },
      { title: "Data School - Python & Pandas", url: "https://www.youtube.com/@dataschool" },
      { title: "StatQuest with Josh Starmer", url: "https://www.youtube.com/@statquest" },
    ],
    courses: [
      { title: "IBM Data Science Professional Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/ibm-data-science" },
      { title: "Data Science MicroMasters", provider: "edX", url: "https://www.edx.org/micromasters/uc-san-diegox-data-science" },
      { title: "Python for Data Science and AI", provider: "Coursera", url: "https://www.coursera.org/learn/python-for-applied-data-science-ai" },
    ],
  },
  "cloud engineering": {
    youtube: [
      { title: "TechWorld with Nana - Cloud Tutorials", url: "https://www.youtube.com/@TechWorldwithNana" },
      { title: "freeCodeCamp.org - AWS Projects", url: "https://www.youtube.com/@freecodecamp" },
      { title: "A Cloud Guru - Cloud Skills", url: "https://www.youtube.com/@acloudguru" },
    ],
    courses: [
      { title: "AWS Certified Cloud Practitioner", provider: "A Cloud Guru", url: "https://acloudguru.com/course/aws-certified-cloud-practitioner" },
      { title: "Google Cloud Professional Cloud Architect", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/gcp-architecture" },
      { title: "Azure Fundamentals", provider: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/certifications/azure-fundamentals/" },
    ],
  },
  "cybersecurity": {
    youtube: [
      { title: "NetworkChuck - Cybersecurity", url: "https://www.youtube.com/@NetworkChuck" },
      { title: "The Cyber Mentor", url: "https://www.youtube.com/@TheCyberMentor" },
      { title: "HackerSploit", url: "https://www.youtube.com/@HackerSploit" },
    ],
    courses: [
      { title: "The Complete Cyber Security Course", provider: "Udemy", url: "https://www.udemy.com/course/the-complete-internet-security-privacy-course-volume-1/" },
      { title: "Intro to Cyber Security", provider: "Udacity", url: "https://www.udacity.com/course/intro-to-cybersecurity--ud123" },
      { title: "Certified Ethical Hacker", provider: "CEH", url: "https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/" },
    ],
  },
  "mobile development": {
    youtube: [
      { title: "Flutter - Official Channel", url: "https://www.youtube.com/@flutterdev" },
      { title: "Android Developers", url: "https://www.youtube.com/@AndroidDevelopers" },
      { title: "iOS Academy", url: "https://www.youtube.com/@iOSAcademy" },
    ],
    courses: [
      { title: "Flutter & Dart - The Complete Guide", provider: "Udemy", url: "https://www.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/" },
      { title: "React Native - The Practical Guide", provider: "Udemy", url: "https://www.udemy.com/course/react-native-the-practical-guide/" },
      { title: "iOS & Swift - The Complete iOS App Development Bootcamp", provider: "Udemy", url: "https://www.udemy.com/course/ios-13-app-development-bootcamp/" },
    ],
  },
  "devops": {
    youtube: [
      { title: "TechWorld with Nana - DevOps", url: "https://www.youtube.com/@TechWorldwithNana" },
      { title: "Docker", url: "https://www.youtube.com/@Docker" },
      { title: "Kubernetes", url: "https://www.youtube.com/@KubernetesCommunity" },
    ],
    courses: [
      { title: "Docker Mastery", provider: "Udemy", url: "https://www.udemy.com/course/docker-mastery/" },
      { title: "Kubernetes for the Absolute Beginners", provider: "Udemy", url: "https://www.udemy.com/course/learn-kubernetes/" },
      { title: "AWS DevOps Engineer Professional", provider: "A Cloud Guru", url: "https://acloudguru.com/course/aws-devops-engineer-professional" },
    ],
  },
  "blockchain": {
    youtube: [
      { title: "Dapp University", url: "https://www.youtube.com/@DappUniversity" },
      { title: "EatTheBlocks", url: "https://www.youtube.com/@EatTheBlocks" },
      { title: "Patrick Collins", url: "https://www.youtube.com/@PatrickAlphaC" },
    ],
    courses: [
      { title: "The Complete Blockchain Developer Course", provider: "Udemy", url: "https://www.udemy.com/course/blockchain-developer/" },
      { title: "Ethereum and Solidity: The Complete Developer's Guide", provider: "Udemy", url: "https://www.udemy.com/course/ethereum-and-solidity-the-complete-developers-guide/" },
      { title: "CryptoZombies", provider: "CryptoZombies", url: "https://cryptozombies.io/" },
    ],
  },
  "game development": {
    youtube: [
      { title: "Brackeys", url: "https://www.youtube.com/@Brackeys" },
      { title: "Game Maker's Toolkit", url: "https://www.youtube.com/@GMTK" },
      { title: "Extra Credits", url: "https://www.youtube.com/@extracredits" },
    ],
    courses: [
      { title: "Complete C# Unity Game Developer 3D", provider: "Udemy", url: "https://www.udemy.com/course/unitycourse2/" },
      { title: "Unreal Engine 5 C++ Developer", provider: "Udemy", url: "https://www.udemy.com/course/unreal-engine-5-cpp-developer/" },
      { title: "Godot Game Development", provider: "Udemy", url: "https://www.udemy.com/course/godot-complete-2d-and-3d-game-development/" },
    ],
  },
};

const normalizeFocus = (value: string) => value.trim().toLowerCase();

export async function POST(request: Request) {
  const context = startApiRequest(request, "generate-course:create");

  try {
    const session = await getServerSession(authOptions);
    const body: GenerateCourseBody = await readJsonBody<GenerateCourseBody>(request, generateCourseSchema);

    const rateLimitKey = session?.user?.id
      ? getRateLimitKey("generate-course:create", session.user.id)
      : getRateLimitKey("generate-course:create", getRequestIp(request));

    const rateLimit = enforceRateLimit({
      key: rateLimitKey,
      limit: 6,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      const response = jsonError("Too many course generation requests", 429, "Please wait before generating another course.", context);
      response.headers.set("retry-after", String(rateLimit.retryAfterSeconds));
      return finishApiRequest(context, response);
    }

    const focusKey = normalizeFocus(body.focus);
    const selected = suggestionsByFocus[focusKey] ?? suggestionsByFocus["ai & machine learning"];

    const base: CourseModule[] = [
      {
        title: `Foundations of ${body.focus}`,
        description: `Start with core principles and basics relevant to ${body.focus}.`,
        duration: "2 weeks",
      },
      {
        title: `${body.level} ${body.focus} Fundamentals`,
        description: `Hands-on exercises and projects designed for ${body.level} learners.`,
        duration: "3 weeks",
      },
      {
        title: `Applied ${body.focus} and Projects`,
        description: `Build real-world projects based on your goal: ${body.goals}.`,
        duration: "4 weeks",
      },
      {
        title: "Capstone & Review",
        description: "Finish with a capstone project, practical review, and a plan for continuing your learning.",
        duration: "2 weeks",
      },
    ];

    const course = base.map((module, index) => ({
      ...module,
      title: `${index + 1}. ${module.title}`,
    }));

    const roadmap = [
      {
        step: 1,
        title: "Learn the fundamentals",
        action: `Focus on the key concepts and theory behind ${body.focus}.`,
      },
      {
        step: 2,
        title: "Build practical projects",
        action: `Apply the skills to real-world projects that match your goals: ${body.goals}.`,
      },
      {
        step: 3,
        title: "Practice with guided resources",
        action: "Use the suggested YouTube tutorials and popular courses to strengthen your understanding.",
      },
      {
        step: 4,
        title: "Reflect and specialize",
        action: "Review your progress, improve weaker areas, and choose an advanced topic to specialize in.",
      },
    ];

    // Save course to database if user is authenticated
    let savedCourse = null;
    if (session?.user?.id) {
      savedCourse = await prisma.course.create({
        data: {
          userId: session.user.id,
          title: `Personalized ${body.focus} Course`,
          focus: body.focus,
          level: body.level,
          goals: body.goals,
          modules: JSON.stringify(course),
          roadmap: JSON.stringify(roadmap),
          youtubeLinks: JSON.stringify(selected.youtube),
          recommendedCourses: JSON.stringify(selected.courses),
        },
      });

      // Log activity
      await prisma.activity.create({
        data: {
          userId: session.user.id,
          courseId: savedCourse.id,
          type: "course_generated",
          description: `Generated a personalized ${body.focus} course`,
        },
      });
    }

    return finishApiRequest(
      context,
      jsonResponse(
        {
          course,
          roadmap,
          youtubeLinks: selected.youtube,
          recommendedCourses: selected.courses,
          message: `Hi ${body.name}, your personalized learning path is ready!`,
          courseId: savedCourse?.id,
        },
        undefined,
        context
      )
    );
  } catch (error) {
    logApiError(context, error);

    if (error instanceof ZodError) {
      return finishApiRequest(context, jsonError("Invalid course generation payload", 400, error.message, context));
    }

    return finishApiRequest(context, jsonError("Failed to generate course", 500, undefined, context));
  }
}
