# Bravework Studio Project Documentation

Welcome to the official documentation for the **Bravework Studio** web application. This project is a comprehensive platform spanning creative services, education, and digital assets.

---

## 🚀 Overview

Bravework Studio is a multi-faceted platform designed to empower creatives and businesses. It integrates a service showcase, a Learning Management System (Academy), an edutainment hub for children (Kids Hub), and a resource rental marketplace.

---

## 🛠️ Technology Stack

| Category           | Technology                                                                                                  |
| :----------------- | :---------------------------------------------------------------------------------------------------------- |
| **Framework**      | [Next.js 14](https://nextjs.org/) (App Router)                                                              |
| **Language**       | [TypeScript](https://www.typescriptlang.org/)                                                               |
| **Database**       | [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)                         |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) (incl. MFA/OTP)                                                    |
| **Styling**        | [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)                  |
| **3D Rendering**   | [Three.js](https://threejs.org/) ([R3F](https://r3f.docs.pmnd.rs/), [Drei](https://github.com/pmndrs/drei)) |
| **Payments**       | [Paystack](https://paystack.com/)                                                                           |
| **Monitoring**     | [Sentry](https://sentry.io/)                                                                                |
| **Storage**        | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)                                                  |
| **AI Integration** | [Google Generative AI](https://ai.google.dev/) (Gemini API)                                                 |
| **Emails**         | [Nodemailer](https://nodemailer.com/) via Resend SMTP                                                       |

---

## ✨ Key Features & Modules

### 🎨 1. Bravework Studio (Creative Services)

- **Showcase**: High-performance landing pages with interactive 3D elements.
- **Project Management**: Clients can track their projects via the `/order` and `/projects` modules.
- **Custom Offers**: Ability to send and accept tailored service quotes (`custom_offers` model).

### 🎓 2. Bravework Academy (LMS)

- **Course Catalog**: Interactive list of courses with categories and tags.
- **Student Dashboard**: Track progress, access session recordings, and manage enrollments.
- **Instructor Portal**: Manage courses, students, and sessions.
- **Certificates**: Automated certificate generation for course completion.

### 🧒 3. Bravework Kids

- **Edutainment**: A dedicated kid-friendly section (`/kids`) featuring episodes, roadmaps, and opportunities.
- **Visual Design**: Specific aesthetic tailored for a younger audience using vibrant colors and playful animations.

### 📝 4. AI-Powered Blog

- **Markdown CMS**: Content managed via markdown files in `/content`.
- **AI Refinement**: Integration with Google Gemini to refine, edit, and optimize blog posts.
- **SEO Optimized**: Automated schema markup and metadata generation.

### 💼 5. Rentals Marketplace

- **Asset Sharing**: Users can list and rent devices or studio space.
- **Booking System**: Escrow-based payments and availability management.
- **Dispute Resolution**: Built-in flow for handling rental issues.

### 💰 6. Referral & Wallet System

- **Earnings**: Users earn via referrals (`referral_earnings`).
- **Digital Wallet**: Internal credit system for payments within the platform.

---

## 📂 Project Structure

```text
/
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
├── components/           # Reusable UI components
├── content/              # Blog markdown files
├── lib/                  # Core logic (DB, Auth, Mailer, AI, Payment Utils)
├── prisma/               # Database schema and migration scripts
├── public/               # Static assets (Images, Videos, 3D Models)
├── scripts/              # Maintenance and seeding scripts
├── styles/               # Global CSS and Tailwind configuration
└── test/                 # Unit and integration tests
```

---

## 🔐 Authentication & Security

- **NextAuth.js**: Handles session management and OAuth/Credentials providers.
- **Multi-Factor Authentication (MFA)**: Support for OTP-based 2FA using `otplib` and `qrcode`.
- **Database Transactions**: Sensitive operations are wrapped in the `lib/db.ts` transaction utility.
- **Input Validation**: Strict schema validation using `Joi`.

---

## ⚙️ Environment Variables

The application requires several environment variables for full functionality. See `.env.local` for local development.

### Database

- `DATABASE_URL`: Connection string for PostgreSQL.

### Authentication

- `NEXTAUTH_SECRET`: Secret used to sign JWTs.
- `NEXTAUTH_URL`: Base URL for the app (e.g., `http://localhost:3000`).

### Services

- `GOOGLE_GENERATIVE_AI_API_KEY`: API key for Gemini.
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: Paystack public key for frontend.
- `PAYSTACK_SECRET_KEY`: Paystack secret for backend verification.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage token.
- `SENTRY_AUTH_TOKEN` & `NEXT_PUBLIC_SENTRY_DSN`: Error monitoring.

### Email (SMTP)

- `MAIL_HOST`: SMTP server (e.g., `smtp.resend.com`).
- `MAIL_USER` / `MAIL_PASS`: SMTP credentials.
- `EMAIL_FROM`: The sender address.

---

## 🛠️ Development Workflow

1.  **Setup**:
    ```bash
    npm install
    npx prisma generate
    ```
2.  **Database**:
    - Deploy migrations: `npx prisma migrate dev`
    - Seed data: `npm run prisma:seed` (if configured) or `npx prisma db seed`
3.  **Running**:
    ```bash
    npm run dev
    ```
4.  **Testing**:
    ```bash
    npm test
    ```

---

## 🤖 AI Agent Guidelines

If you are an AI agent working on this project:

- Always refer to `AGENTS.md` for house rules.
- Check the ADK Skill at `.agent/skills/ADK/SKILL.md`.
- Ensure TypeScript strictness at all times.

---

## 📜 License

Private and confidential. &copy; 2026 Bravework Studio.
