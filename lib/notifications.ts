import { queryDatabase } from "./db";

export async function getUserIdByEmail(email: string): Promise<string | null> {
  const result = await queryDatabase(
    "SELECT user_id FROM users WHERE email = $1",
    [email]
  );
  return result[0]?.user_id || null;
}

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification({
  userId,
  title,
  message,
  link = "",
}: CreateNotificationParams) {
  try {
    const queryText = `
      INSERT INTO notifications (user_id, title, message, link)
      VALUES ($1, $2, $3, $4)
      RETURNING notification_id;
    `;
    const result = await queryDatabase(queryText, [
      userId,
      title,
      message,
      link,
    ]);
    return result[0];
  } catch (error) {
    console.error("Error creating notification:", error);
    // We don't want to throw here to avoid breaking the main flow (e.g. email sending)
    // but it might be better to know if it failed.
  }
}
