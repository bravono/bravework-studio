import { compressImage } from "./image";

export async function uploadFile(file: File, category: string) {
  let fileToUpload = file;

  // Compress image if it's an image
  if (file.type.startsWith("image/")) {
    try {
      // 2MB max for images to be safe within blob limits
      fileToUpload = await compressImage(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1600,
      });
    } catch (error) {
      console.warn("Failed to compress image, using original:", error);
    }
  }

  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("category", category);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        errorData.message ||
        `Upload failed for ${fileToUpload.name}`,
    );
  }

  const result = await response.json();

  return {
    fileName: result.name || file.name,
    fileSize: file.size,
    fileUrl: result.url,
  };
}
