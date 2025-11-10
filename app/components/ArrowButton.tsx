import { ArrowRight } from "lucide-react";

export default function ArrowButton({ label, link, style }) {
  return (
    <div className={`${style} flex justify-center`}>
      <a
        href={link}
        className="inline-flex items-center px-10 py-5 border border-transparent text-xl font-bold rounded-full shadow-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 group"
      >
        {label}
        <ArrowRight className="ml-2 h-6 w-6 transition-transform duration-200 group-hover:translate-x-1" />
      </a>
    </div>
  );
}
