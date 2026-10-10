import { File } from "expo-file-system";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_PRESET;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export const uploadImage = async (uri, folder = "misc") => {
  if (!uri) throw new Error("ไม่พบไฟล์รูปภาพ");

  const body = new FormData();
  body.append("file", new File(uri));
  body.append("upload_preset", UPLOAD_PRESET);
  body.append("folder", folder);

  const res = await fetch(UPLOAD_URL, { method: "POST", body });
  const json = await res.json().catch(() => {
    throw new Error("Cloudinary ตอบกลับผิดรูปแบบ");
  });

  if (!res.ok) throw new Error(json?.error?.message || "อัปโหลดรูปไม่สำเร็จ");

  return { url: json.secure_url, publicId: json.public_id };
};

export const uploadImages = (uris, folder) =>
  Promise.all(uris.map((uri) => uploadImage(uri, folder)));