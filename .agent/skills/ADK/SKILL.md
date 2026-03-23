---
name: ADK
description: Agent Development Kit for Bravework Studio (Next.js)
---

# Bravework Studio Agent Development Kit (ADK)

This skill provides essential context and instructions for AI agents working on the Bravework Studio Next.js project.

## Project Core Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (direct `pg` pool via `lib/db.ts`) and Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS, Framer Motion
- **Monitoring**: Sentry
- **API**: Route Handlers in `app/api/`

## Development Guidelines

### 1. Database Operations

- Use `lib/db.ts` for direct PostgreSQL queries when performance or complex joins are required.
- Use `prisma` for standard CRUD operations and schema management.
- Always use the `withTransaction` wrapper in `lib/db.ts` for multi-step database writes.

### 2. API Design

- New API routes should be placed in `app/api/` following the App Router convention (`route.ts`).
- Handle errors gracefully and use meaningful HTTP status codes.
- Use the project's logging utility in `lib/logger.ts`.

### 3. Component Architecture

- Prefer Server Components where possible for better performance and SEO.
- Use `"use client"` directive only for components requiring interactivity or browser APIs.
- Utilize Framer Motion for smooth, premium micro-animations.

### 4. Code Style

- Consistent use of TypeScript for type safety.
- Follow existing patterns for file naming and directory structure.
- Always check `AGENTS.md` at the project root for general house rules.

## Recommended Tools

- `npm run dev`: Start the development server.
- `npx prisma studio`: Browse the database visually.
- `npm run lint`: Check for linting errors.
