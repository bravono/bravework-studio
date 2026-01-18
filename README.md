# Bravework Studio Website

A modern, interactive website showcasing Bravework Studio's services in 3D modeling, web development, and UI/UX design.

## Features

- Interactive 3D elements using Three.js
- Modern, responsive design
- Smooth animations with Framer Motion
- Nigerian-inspired color scheme
- Service showcase sections

## Tech Stack

- Next.js 14
- React 18
- Three.js
- Tailwind CSS
- Framer Motion
- TypeScript

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

5. Set up env variables

6. Run the database migrations: npx prisma migrate dev

7. If they’re connecting to an existing database instead of starting fresh: npx prisma db pull

8. Generate Prisma Client (if not already done): npx prisma generate


## Project Structure

- `/app` - Next.js app directory containing pages and layouts
- `/components` - Reusable React components
- `/public` - Static assets
- `/styles` - Global styles and Tailwind configuration

## Development

- The website uses Next.js 14 with the App Router
- Three.js components are client-side rendered to avoid SSR issues
- Tailwind CSS is used for styling
- Framer Motion handles animations

## License

This project is private and confidential. 