import { NextRequest, NextResponse } from "next/server";
import { addTodoAttachment } from "@/lib/todoService";

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
    const { fileUrl, fileName, fileType, fileSize } = body;

    if (!fileUrl || !fileType) {
      return NextResponse.json(
        { success: false, message: "fileUrl and fileType are required" },
        { status: 400 }
      );
    }

    const attachment = await addTodoAttachment({
      todoId,
      fileUrl,
      fileName,
      fileType,
      fileSize,
    });

    return NextResponse.json({
      success: true,
      data: attachment,
    });
  } catch (error: any) {
    console.error("POST /api/projects/[orderId]/todos/[todoId]/attachments error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to attach media" },
      { status: 500 }
    );
  }
}
