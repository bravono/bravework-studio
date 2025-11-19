import crypto from 'crypto';

export function generateJitsiRoom(courseId: number, sessionId: number): string {
  const random = crypto.randomBytes(4).toString('hex');
  return `course-${courseId}-session-${sessionId}-${random}`;
}
