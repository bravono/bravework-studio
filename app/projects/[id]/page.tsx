import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LiveProjectTracker } from "@/components/projects/LiveProjectTracker";
import prisma from "@/lib/prisma";

export default async function ProjectDetails({ params }: { params: { id: string } }) {
  const orderId = parseInt(params.id, 10);

  let order = null;
  if (!isNaN(orderId)) {
    order = await prisma.orders.findUnique({
      where: { order_id: orderId },
      include: {
        product_categories: true,
        users: true,
      },
    });
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-3xl font-bold text-white">Project Not Found</h1>
          <p className="text-slate-400 text-sm">
            We couldn't locate project #{params.id}. It may not exist or has been archived.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Dynamic Live Project Tracker Component */}
        <LiveProjectTracker
          orderId={order.order_id}
          projectTitle={order.title || `Project #${order.order_id}`}
          categoryName={order.product_categories?.category_name || "Custom Service"}
          startDate={order.start_date ? order.start_date.toISOString() : undefined}
          endDate={order.end_date ? order.end_date.toISOString() : undefined}
          amountPaidFormatted={`₦${(order.amount_paid_to_date_kobo / 100).toLocaleString()}`}
          isAdminOrTeam={true}
          currentUserId={order.user_id}
        />
      </div>
    </main>
  );
}
