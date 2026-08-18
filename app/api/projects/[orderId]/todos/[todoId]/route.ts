import { NextRequest, NextResponse } from "next/server";
import { toggleTodoCheckoff } from "@/lib/todoService";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string; todoId: string } }
) {
  try {
    const todoId = parseInt(params.todoId, 10);
    if (isNaN(todoId)) {
      return NextResponse.json(
        { success: false, message: "Invalid todo ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { isCompleted } = body;

    if (typeof isCompleted !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isCompleted boolean state required" },
        { status: 400 }
      );
    }

    const updated = await toggleTodoCheckoff(todoId, isCompleted);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/projects/[orderId]/todos/[todoId] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update todo status" },
      { status: 500 }
    );
  }
}
