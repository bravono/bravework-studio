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

## AI Customer Service and Offering Gap Intelligence

Bravework Studio includes an intelligent, trainable AI customer service and business intelligence engine.

### Key Capabilities

1. **Interactive Client Support**:
   - Floating widget mounted globally via the root layout.
   - Answers inquiries regarding 3D animation, software engineering, UI/UX design, Academy courses, kids hub, and hardware rentals.
   - Session continuity stored in local client state.

2. **Context-Aware Service Recommendations**:
   - Interprets visitor requirements and recommends matching services with direct action links (`/order`, `/services`, `/academy`, `/hub`, `/kids`).

3. **Trainable Knowledge Base and Escalation Pipeline**:
   - When the AI encounters unknown topics or ambiguous pricing requests, it flags an escalation marker (`[ESCALATE: ...]`) and records a pending ticket in `ai_escalations`.
   - Administrators review pending escalations in the Admin Dashboard.
   - Providing an answer marks the escalation resolved and automatically writes the question and verified answer into `ai_knowledge_base`.
   - The AI immediately references this memory for all future visitor interactions.

4. **Direct Admin Training**:
   - Administrators can add, edit, search, and toggle knowledge base records directly in the Admin Dashboard under the AI Customer Service tab.

5. **Business Offering Gap Detection and Portal**:
   - Analyzes customer demand for unprovided services or courses.
   - Flags business gaps (`[BUSINESS_GAP: ...]`) and logs structured opportunities in `ai_offering_gaps`.
   - Admin Portal enables tracking of status (`new`, `under_review`, `planned`, `adopted`, `dismissed`), potential impact, occurrences, and action notes.
   - Includes on-demand conversation synthesis to identify macro trends.

### API Reference

| Method | Route | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chat` | Process customer chat messages, recommend services, and detect escalations/gaps | Public |
| `GET` | `/api/chat/history` | Retrieve message history for a session | Public |
| `GET` | `/api/admin/ai-service/knowledge` | List knowledge entries with category and search filter | Admin |
| `POST` | `/api/admin/ai-service/knowledge` | Add direct knowledge entry to AI memory | Admin |
| `PUT` | `/api/admin/ai-service/knowledge/:id` | Update knowledge entry | Admin |
| `DELETE` | `/api/admin/ai-service/knowledge/:id` | Remove knowledge entry | Admin |
| `GET` | `/api/admin/ai-service/escalations` | List unanswered customer escalations | Admin |
| `POST` | `/api/admin/ai-service/escalations/:id/resolve` | Answer escalation and update AI memory | Admin |
| `GET` | `/api/admin/ai-service/gaps` | List detected offering gaps and statistics | Admin |
| `POST` | `/api/admin/ai-service/gaps` | Manually record an offering opportunity | Admin |
| `PUT` | `/api/admin/ai-service/gaps/:id` | Update gap status and action plan notes | Admin |
| `DELETE` | `/api/admin/ai-service/gaps/:id` | Remove gap record | Admin |
| `POST` | `/api/admin/ai-service/gaps/synthesize` | Run AI analysis over chat history to uncover new gaps | Admin |
| `GET` | `/api/admin/ai-service/conversations` | View recent visitor chat transcripts | Admin |

---

## AI Agent Guidelines

If you are an AI agent working on this project:

- Always refer to `AGENTS.md` for house rules.
- Check the ADK Skill at `.agent/skills/ADK/SKILL.md`.
- Ensure TypeScript strictness at all times.

---

## License

Private and confidential. &copy; 2026 Bravework Studio.
