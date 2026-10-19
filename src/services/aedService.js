import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

//ดึงAEDทั้งหมด
export const subscribeAEDs = (onData, onError) =>
  onSnapshot(
    collection(db, "aeds"),
    (snap) => {
      const list = snap.docs
        .filter((d) => d.data().location)
        .map((d) => {
          const { name, description, status, location } = d.data();
          return {
            id: d.id,
            name: name || "ไม่ระบุชื่อ",
            description: description || "",
            status: status || "active",
            latitude: location.latitude,
            longitude: location.longitude,
          };
        });
      onData(list);
    },
    onError
  );

//คำนวณระยะห่างสูตร Haversine
export const distanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; //รัศมีโลก
  const toRad = (d) => (d * Math.PI) / 180; //แปลงเป็นเรเดียน
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

//เรียงAEDจากใกล้ไปไกล
export const sortByDistance = (aeds, location) => {
  if (!location) return aeds.map((a) => ({ ...a, distance: null }));
  return aeds
    .map((a) => ({
      ...a,
      distance: distanceMeters(location.latitude, location.longitude, a.latitude, a.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);
};

//แปลงหน่วย เมตรหรือกิโลเมตร
export const formatDistance = (m) => {
  if (m == null) return "";
  return m < 1000 ? `${Math.round(m)} ม.` : `${(m / 1000).toFixed(1)} กม.`;
};