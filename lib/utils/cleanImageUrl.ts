/**
 * Utility to clean and extract pure image URLs from raw strings,
 * handling malformed database inputs such as embedded HTML attributes,
 * quotes, backslashes, or Flickr embed snippets.
 */
export function cleanImageUrl(url: any): string {
  if (!url || typeof url !== "string") {
    return "/assets/Bravework_Studio-Logo-Color.png";
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return "/assets/Bravework_Studio-Logo-Color.png";
  }

  // Extract pure http(s) URL if embedded in HTML snippet or attributes
  const httpMatch = trimmed.match(/https?:\/\/[^\s"'\\<>]+/i);
  if (httpMatch) {
    return httpMatch[0].replace(/\\+$/, "").trim();
  }

  // Clean surrounding quotes or backslashes for relative paths
  const sanitized = trimmed.replace(/^["'\\\s]+|["'\\\s]+$/g, "").trim();
  if (sanitized.startsWith("/") || sanitized.startsWith("http://") || sanitized.startsWith("https://")) {
    return sanitized;
  }

  return "/assets/Bravework_Studio-Logo-Color.png";
}
