import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as Location from "expo-location";
import { useUser } from "./UserContext";

const LocationContext = createContext(null);
export const useLocation = () => useContext(LocationContext);

const TARGET_ACCURACY = 20;
const MAX_WAIT_MS = 5000;

// รอจนได้ค่าที่แม่นพอ หรือหมดเวลา แล้วคืนค่าที่ดีที่สุดที่เจอ
const getBestPosition = async () => {
  let best = null;
  const sub = await Location.watchPositionAsync(
    { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 0 },
    (pos) => {
      if (!best || pos.coords.accuracy < best.accuracy) best = pos.coords;
    }
  );
  const start = Date.now();
  while (Date.now() - start < MAX_WAIT_MS && !(best && best.accuracy <= TARGET_ACCURACY)) {
    await new Promise((r) => setTimeout(r, 500));
  }
  sub.remove();

  if (!best) {
    const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    best = p.coords;
  }
  return best;
};

export const LocationProvider = ({ children }) => {
  const { authUser } = useUser();
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("กำลังระบุตำแหน่ง...");
  const [addressDetail, setAddressDetail] = useState(null);
  const [source, setSource] = useState("gps"); //gps,manual
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const loadAddress = async (coords) => {
    try {
      const [a] = await Location.reverseGeocodeAsync(coords);
      if (!a) return;
      const detail = {
        name: a.name || null, street: a.street || null, district: a.district || null,
        subregion: a.subregion || null, city: a.city || null,
        region: a.region || null, postalCode: a.postalCode || null,
      };
      setAddressDetail(detail);
      setAddress(Object.values(detail).filter(Boolean).join(" ") || "ไม่พบที่อยู่");
    } catch {
      setAddress("ไม่สามารถแปลงเป็นที่อยู่ได้");
    }
  };

  //ดึงตำแหน่งจาก GPS
  const refresh = useCallback(async () => {
    setLoading(true);
    setAddress("กำลังระบุตำแหน่ง...");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermissionDenied(true);
        setAddress("ไม่ได้รับอนุญาตให้เข้าถึง GPS");
        return false;
      }
      setPermissionDenied(false);
      const c = await getBestPosition();
      setLocation({ latitude: c.latitude, longitude: c.longitude, accuracy: c.accuracy });
      setSource("gps");
      await loadAddress(c);
      return c;
    } catch {
      setAddress("ระบุตำแหน่งไม่สำเร็จ ลองใหม่อีกครั้ง");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  //ผู้ใช้ปักหมุดเอง
  const setManualLocation = async ({ latitude, longitude }) => {
    setLocation({ latitude, longitude, accuracy: null });
    setSource("manual");
    setAddress("กำลังระบุที่อยู่...");
    await loadAddress({ latitude, longitude });
  };

  //ดึงตำแหน่งเมื่อล็อกอินแล้ว
  useEffect(() => {
    if (authUser) refresh();
    else { setLocation(null); setAddressDetail(null); }
  }, [authUser?.uid]);

  return (
    <LocationContext.Provider
      value={{ location, address, addressDetail, source, loading, permissionDenied, refresh, setManualLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
};