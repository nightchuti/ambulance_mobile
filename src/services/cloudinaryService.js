import * as FileSystem from "expo-file-system/legacy";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_PRESET;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export const uploadImage = async (uri, folder = "misc") => {
  if (!uri) throw new Error("ไม่พบไฟล์รูปภาพ");

  const res = await FileSystem.uploadAsync(CLOUDINARY_URL, uri, {
    httpMethod: "POST",
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: "file",
    mimeType: "image/jpeg",
    parameters: {
      upload_preset: UPLOAD_PRESET,
      folder,
    },
  });

  let json;
  try {
    json = JSON.parse(res.body);
  } catch {
    throw new Error("Cloudinary ตอบกลับผิดรูปแบบ");
  }

  if (res.status < 200 || res.status >= 300) {
    throw new Error(json?.error?.message || "อัปโหลดรูปไม่สำเร็จ");
  }

  return { url: json.secure_url, publicId: json.public_id };
};

export const uploadImages = (uris, folder) =>
  Promise.all(uris.map((u) => uploadImage(u, folder)));

// const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dhqvixl0i/image/upload";
// const UPLOAD_PRESET = "b3geiiua";

// export const uploadToCloudinary = async (uri) => {
//   const data = new FormData();
//   data.append("file", { uri, type: "image/jpeg", name: "profile_image.jpg" });
//   data.append("upload_preset", UPLOAD_PRESET);
//   data.append("folder", "profiles/2026");

//   const response = await fetch(CLOUDINARY_URL, { method: "POST", body: data });
//   const result = await response.json();
//   return result.secure_url; // คืน URL มาให้ ProfileForm เอาไปเก็บ Firestore
// };