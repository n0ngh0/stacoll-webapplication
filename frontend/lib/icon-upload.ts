const MAX_ICON_BYTES = 256 * 1024;

export async function fileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }
  if (file.size > MAX_ICON_BYTES) {
    throw new Error("Image must be smaller than 256KB");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

export function isPersistableIcon(url: string) {
  return (
    url.startsWith("http") ||
    url.startsWith("https") ||
    url.startsWith("data:image/")
  );
}
