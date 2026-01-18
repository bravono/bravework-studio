export async function uploadFile(file: File, category: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || errorData.message || `Upload failed for ${file.name}`
    );
  }

  const result = await response.json();

  return {
    fileName: result.name || file.name,
    fileSize: file.size,
    fileUrl: result.url,
  };
}
