# AI CourseCrafter

AI CourseCrafter is a personalized learning platform built with Next.js, React, TypeScript, Prisma, and Tailwind CSS. It includes AI-generated course paths, a progress dashboard, authentication, theme switching, and a floating AI Mentor assistant for answering learning and product questions.

## Setup

```bash
npm install
npm run dev
npm run build
```

The app runs at <http://localhost:3000>.

## Project Structure

```text
aicrafter/
├── app/
├── components/
├── lib/
├── prisma/
├── public/
└── types/
```

## AI Mentor Assistant

The floating assistant is available across the app and answers questions about the dashboard, learning paths, streaks, auth flow, and site usage. If `OPENAI_API_KEY` is set, it uses an OpenAI-compatible chat completion request; otherwise it falls back to built-in guidance so the UI still works. Set `OPENAI_API_KEY` in `.env.local` for live responses.

## Backend Structure

The backend is being built in small slices so each API layer stays reusable:

- `app/api/assistant/route.ts` handles chat requests.
- `lib/assistant/openai.ts` contains the assistant prompt, OpenAI request logic, and fallback replies.
- `lib/server/api.ts` provides shared JSON helpers for future route handlers.

Current environment variables:

- `DATABASE_URL` for Prisma
- `NEXTAUTH_SECRET` and `NEXTAUTH_URL` for authentication
- `OPENAI_API_KEY` for live assistant replies
- `OPENAI_MODEL` and `OPENAI_BASE_URL` for OpenAI-compatible providers

## API Docs and Backend Checks

Endpoint examples and request/response samples live in [docs/api.md](docs/api.md).

Useful backend commands:

```bash
npm run db:seed
npm run test:api
npm run build
```

