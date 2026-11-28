import { NextRequest, NextResponse } from "next/server";
import { addTodoComment } from "@/lib/todoService";

export async function POST(
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
    const { userId, content, imageUrl } = body;

    if (!userId || (!content && !imageUrl)) {
      return NextResponse.json(
        { success: false, message: "User ID and comment content or image are required" },
        { status: 400 }
      );
    }

    const comment = await addTodoComment({
      todoId,
      userId: parseInt(userId, 10),
      content: content || "",
      imageUrl: imageUrl || undefined,
    });

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error: any) {
    console.error("POST /api/projects/[orderId]/todos/[todoId]/comments error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to post comment" },
      { status: 500 }
    );
  }
}
