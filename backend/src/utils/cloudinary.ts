import crypto from "crypto";

/**
 * สร้าง SHA-1 signature สำหรับ Cloudinary API
 */
function generateSignature(params: Record<string, string | number>, apiSecret: string): string {
  // เรียงลำดับ params และสร้าง string สำหรับ sign
  const sortedKeys = Object.keys(params).sort();
  const signString = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join("&") + apiSecret;

  return crypto.createHash("sha1").update(signString).digest("hex");
}

/**
 * Upload รูปภาพไปยัง Cloudinary และคืน URL ของรูปที่ upload สำเร็จ
 * @param fileBuffer - Buffer ของไฟล์รูปภาพ
 * @param folder - folder ใน Cloudinary ที่ต้องการเก็บ (เช่น 'stacoll/profiles')
 * @returns Cloudinary secure URL
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = "stacoll"
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateSignature({ folder, timestamp }, apiSecret);

  const formData = new FormData();
  formData.append("file", new Blob([fileBuffer]));
  formData.append("folder", folder);
  formData.append("timestamp", timestamp.toString());
  formData.append("api_key", apiKey);
  formData.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudinary upload failed: ${errText}`);
  }

  const data = await res.json() as { secure_url: string; public_id: string };
  return data.secure_url;
}

/**
 * ลบรูปภาพจาก Cloudinary โดยใช้ public_id
 * @param publicId - Cloudinary public ID ของรูป
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateSignature({ public_id: publicId, timestamp }, apiSecret);

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("timestamp", timestamp.toString());
  formData.append("api_key", apiKey);
  formData.append("signature", signature);

  await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    { method: "POST", body: formData }
  );
}
