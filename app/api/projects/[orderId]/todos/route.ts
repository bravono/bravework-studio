import { NextRequest, NextResponse } from "next/server";
import {
  getProjectTodos,
  populateInitialProjectTodos,
} from "@/lib/todoService";

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = parseInt(params.orderId, 10);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid project/order ID" },
        { status: 400 }
      );
    }

    let todos = await getProjectTodos(orderId);

    // If no todos exist yet, populate using AI tasks logic
    if (todos.length === 0) {
      todos = await populateInitialProjectTodos(orderId);
    }

    return NextResponse.json({
      success: true,
      data: todos,
    });
  } catch (error: any) {
    console.error("GET /api/projects/[orderId]/todos error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
