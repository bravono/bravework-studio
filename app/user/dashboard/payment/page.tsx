import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import PaymentContent from "./PaymentContent";

export const dynamic = "force-dynamic";

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
