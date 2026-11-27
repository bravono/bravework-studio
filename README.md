# Bravework Studio Website

A modern, interactive platform showcasing Bravework Studio's ecosystem: creative services, an academy hub, and resource rentals.

---

## 🚀 Quick Start

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Environment Setup**:
   Copy `.env.example` to `.env.local` and fill in the required keys.

3. **Database Initialization**:

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## 📚 Documentation

For a deep dive into the architecture, features, and technical details, please refer to the:

👉 **[Full Documentation (DOCUMENTATION.md)](./DOCUMENTATION.md)**

---

## 🛠️ Key Technologies

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion
- **Interactive**: Three.js (@react-three/fiber)
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: NextAuth.js
- **Payment**: Paystack

---

## 🤖 AI Agents

If you are an AI assistant working on this codebase, please prioritize following the guidelines in **[AGENTS.md](./AGENTS.md)** and the ADK skill.

---

## 📜 License

This project is private and confidential property of Bravework Studio.

---

## Brand Assets and Logo Integration

The application uses official high-resolution logo variants located in `public/assets/`:
- `Bravework_Studio-Logo-Color.png` (`logo-green.png`): Primary brand green logo for light backgrounds and the primary navigation header (`Navbar.tsx`).
- `Bravework_Studio-Logo-Black.png` (`logo-black.png`): Monochrome black logo.
- `Bravework_Studio-Logo-White.png` (`logo-white.png`): High-contrast white logo for dark surfaces, fallback avatars, and the interactive 3D virtual office texture (`BouncingLogo.ts`).
- `BWS_Text-Logo.png`: Sourced from the white logo asset for legacy 3D texture compatibility.
- 3D Virtual Office: `BouncingLogo.ts` uses geometry matching the natural 130:150 aspect ratio (`130/150` width to `1.0` height) with uniform scaling, eliminating texture stretching.
- Favicon and SEO JSON-LD schema link directly to the updated brand color asset.
