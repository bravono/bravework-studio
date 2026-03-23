# Agent Rules (AGENTS.md)

Welcome, AI Agent! To ensure a productive collaboration on this Next.js project, please follow these guidelines.

## 1. Consult Bundled Documentation

Next.js bundles its documentation. Always check the following path for up-to-date API references before relying on external knowledge:

- `node_modules/next/dist/docs/`

## 2. Use the Agent Development Kit (ADK) Skill

We have a dedicated skill that defines our project-specific patterns and best practices. Please refer to it frequently:

- Location: `.agent/skills/ADK/SKILL.md`

## 3. Project Configuration

- **Package Manager**: `npm`
- **Database**: PostgreSQL & Prisma
- **Auth**: NextAuth

## 4. House Rules

- **TypeScript**: Always use strict TypeScript typing. No `any` unless absolutely necessary.
- **Testing**: Run `npm test` after significant changes to ensure no regressions.
- **Commits**: Use descriptive commit messages.
- **Refactoring**: If you see an opportunity to improve code readability or performance following established patterns, propose it!

## 5. Security

- Never expose environment variables or secrets.
- Use the `lib/db.ts` transaction wrapper for sensitive database operations.
