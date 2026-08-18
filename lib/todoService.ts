import prisma from "@/lib/prisma";
import { generateProjectTodos } from "./ai/generateProjectTodos";

export async function populateInitialProjectTodos(orderId: number) {
  // Check if project already has initialized todos
  const existingCount = await prisma.todos.count({
    where: { project_id: orderId },
  });

  if (existingCount > 0) {
    return await getProjectTodos(orderId);
  }

  // Generate AI breakdown
  const aiTodos = await generateProjectTodos(orderId);

  // Batch insert into database
  await prisma.todos.createMany({
    data: aiTodos.map((item, index) => ({
      project_id: orderId,
      titile: item.title,
      description: item.description,
      milestone_title: item.milestoneTitle,
      position_order: item.positionOrder || index + 1,
      status: "pending",
      is_completed: false,
    })),
  });

  return await getProjectTodos(orderId);
}

export async function getProjectTodos(orderId: number) {
  const todos = await prisma.todos.findMany({
    where: { project_id: orderId },
    orderBy: [
      { milestone_title: "asc" },
      { position_order: "asc" },
      { todo_id: "asc" },
    ],
    include: {
      todo_attachments: {
        orderBy: { created_at: "desc" },
      },
      todo_comments: {
        orderBy: { created_at: "asc" },
        include: {
          users: {
            select: {
              user_id: true,
              first_name: true,
              last_name: true,
              profile_picture_url: true,
            },
          },
        },
      },
    },
  });

  return todos;
}

export async function toggleTodoCheckoff(
  todoId: number,
  isCompleted: boolean
) {
  const updated = await prisma.todos.update({
    where: { todo_id: todoId },
    data: {
      is_completed: isCompleted,
      status: isCompleted ? "completed" : "in_progress",
      completed_at: isCompleted ? new Date() : null,
      updated_at: new Date(),
    },
    include: {
      todo_attachments: true,
      todo_comments: {
        include: {
          users: {
            select: {
              user_id: true,
              first_name: true,
              last_name: true,
              profile_picture_url: true,
            },
          },
        },
      },
    },
  });

  return updated;
}

export async function addTodoAttachment(params: {
  todoId: number;
  fileUrl: string;
  fileName?: string;
  fileType: string;
  fileSize?: string;
}) {
  const attachment = await prisma.todo_attachments.create({
    data: {
      todo_id: params.todoId,
      file_url: params.fileUrl,
      file_name: params.fileName || "attachment",
      file_type: params.fileType,
      file_size: params.fileSize || "N/A",
    },
  });

  return attachment;
}

export async function addTodoComment(params: {
  todoId: number;
  userId: number;
  content: string;
  imageUrl?: string;
}) {
  const comment = await prisma.todo_comments.create({
    data: {
      todo_id: params.todoId,
      user_id: params.userId,
      content: params.content,
      image_url: params.imageUrl || null,
    },
    include: {
      users: {
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          profile_picture_url: true,
        },
      },
    },
  });

  return comment;
}
