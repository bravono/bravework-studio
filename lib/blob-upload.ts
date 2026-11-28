import { put } from "@vercel/blob";

export async function uploadToBlob(file: File, category: string) {
  const fileName = file.name;

  // Generate a unique filename by appending a timestamp before the extension
  const extIndex = fileName.lastIndexOf(".");
  const base = extIndex !== -1 ? fileName.substring(0, extIndex) : fileName;
  const ext = extIndex !== -1 ? fileName.substring(extIndex) : "";
  const uniqueName = `${base}-${Date.now()}${ext}`;

  // Determine the correct folder based on the environment
  const envPrefix =
    process.env.NODE_ENV === "production"
      ? `bws-production/${category}`
      : `bws-test/${category}`;

  const fullPath = `${envPrefix}/${uniqueName}`;

  // Upload the file with the environment-specific path and unique name
  const uploaded = await put(fullPath, file, { access: "public" });

  return {
    url: uploaded.url,
    name: uniqueName,
    size: file.size,
    pathname: uploaded.pathname,
  };
}
