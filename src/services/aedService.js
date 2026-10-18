import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

// ดึง AED ทั้งหมดแบบ realtime แล้วแปลง GeoPoint เป็น latitude/longitude
export const subscribeAEDs = (onData, onError) =>
  onSnapshot(
    collection(db, "aeds"),
    (snap) => {
      const list = snap.docs
        .filter((d) => d.data().location) // ข้ามเอกสารที่ยังไม่มีพิกัด
        .map((d) => {
          const x = d.data();
          return {
            id: d.id,
            name: x.name || "ไม่ระบุชื่อ",
            description: x.description || "",
            status: x.status || "active",
            latitude: x.location.latitude,
            longitude: x.location.longitude,
          };
        });
      onData(list);
    },
    onError
  );

// ระยะทางระหว่าง 2 จุด (เมตร) สูตร Haversine
export const distanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};