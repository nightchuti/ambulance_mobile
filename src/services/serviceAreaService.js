import { Alert, Linking } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { distanceMeters } from "./aedService";

export const checkServiceArea = async (location) => {
  try {
    const snap = await getDoc(doc(db, "settings", "serviceArea"));

    if (!snap.exists()) return { inside: true };
    const { center, radius, enabled } = snap.data();
    if (enabled === false || !center || typeof radius !== "number") {
      return { inside: true };
    }

    const distance = distanceMeters(
      location.latitude, location.longitude,
      center.latitude, center.longitude
    );
    return { inside: distance <= radius };
  } catch (e) {
    console.warn("checkServiceArea failed", e);
    return { inside: true };
  }
};

//ตรวจสอบ+แจ้งเตือน
export const confirmInServiceArea = async (location, navigation) => {
  const result = await checkServiceArea(location);
  if (result.inside) return true;

  Alert.alert(
    "อยู่นอกพื้นที่ให้บริการ",
    `กรุณาตรวจสอบตำแหน่งอีกครั้ง หรือโทร 1669 แทน`,
    [
      { text: "ปิด", style: "cancel" },
      { text: "เลือกตำแหน่งใหม่", onPress: () => navigation.navigate("PickLocation") },
      { text: "โทร 1669", onPress: () => Linking.openURL("tel:1669") },
    ]
  );
  return false;
};