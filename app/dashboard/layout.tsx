import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <span className="inline-block font-bold">Bravework Studio</span>
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <Link
                href="/"
                className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <div className="container py-6 md:py-10">{children}</div>
    </div>
  );
}
