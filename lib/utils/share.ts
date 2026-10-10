/**
 * Utility functions for sharing courses and course bundles.
 */

export interface ShareDataPayload {
  title: string;
  text?: string;
  url: string;
}

/**
 * Resolves a full URL given a path or existing full URL.
 * Falls back to window.location.origin in browsers or braveworkstudio.com domain.
 */
export function resolveShareUrl(pathOrUrl?: string, baseOrigin?: string): string {
  if (!pathOrUrl) {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return baseOrigin || "https://braveworkstudio.com";
  }

  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const origin =
    baseOrigin ||
    (typeof window !== "undefined"
      ? window.location.origin
      : "https://braveworkstudio.com");

  const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${origin}${cleanPath}`;
}

/**
 * Constructs share metadata for a single course.
 */
export function createCourseShareData(params: {
  courseId: number | string;
  title: string;
  description?: string;
  origin?: string;
}): ShareDataPayload {
  const cleanId = String(params.courseId).replace(/^course-/, "");
  const url = resolveShareUrl(`/academy/courses/${cleanId}`, params.origin);
  const snippet = params.description
    ? params.description.length > 150
      ? `${params.description.slice(0, 147)}...`
      : params.description
    : `Check out ${params.title} at Bravework Studio Academy`;

  return {
    title: `${params.title} | Bravework Studio Academy`,
    text: snippet,
    url,
  };
}

/**
 * Constructs share metadata for a course bundle.
 */
export function createBundleShareData(params: {
  bundleId: number | string;
  title: string;
  courseCount?: number;
  description?: string;
  origin?: string;
}): ShareDataPayload {
  const cleanId = String(params.bundleId).replace(/^bundle-/, "");
  const url = resolveShareUrl(`/academy/bundles/${cleanId}`, params.origin);
  const countLabel = params.courseCount ? ` (${params.courseCount} Courses)` : "";

  return {
    title: `${params.title}${countLabel} | Bravework Studio Academy`,
    text:
      params.description ||
      `Accelerate your learning with the ${params.title} bundled learning path at Bravework Studio Academy.`,
    url,
  };
}
