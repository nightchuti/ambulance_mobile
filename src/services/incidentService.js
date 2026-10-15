import {
  collection, doc, writeBatch, onSnapshot, query, where, orderBy, limit, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { STATUS } from "../constants/incident";

export const newIncidentId = () => doc(collection(db, "incidents")).id;

// สร้างเหตุ (ใช้ทั้งแบบด่วนและแบบกรอกรายละเอียด)
export const createIncident = async ({
  id, uid, profile, mode, type, severity = null, description = "",
  location, address, addressDetail, source, images = [],
}) => {
  const ref = doc(db, "incidents", id);
  const batch = writeBatch(db);

  batch.set(ref, {
    userId: uid,
    mode,
    type,
    severity,
    description: description.trim(),
    images,
    reporter: {
      name: `${profile.firstname} ${profile.lastname}`,
      phone: profile.phone,
    },
    location: {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy ?? null,
      source: source || "gps",
    },
    address: address || "",
    addressDetail: addressDetail || null,
    status: STATUS.PENDING,
    assignedTo: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(doc(collection(ref, "timeline")), {
    status: STATUS.PENDING,
    note: mode === "quick" ? "ผู้ใช้แจ้งเหตุด่วน" : "ผู้ใช้แจ้งเหตุ",
    at: serverTimestamp(),
  });

  await batch.commit();
  return ref.id;
};

// ฟังเหตุเดียวแบบ real-time (หน้า Status)
export const subscribeIncident = (id, onData, onError) =>
  onSnapshot(
    doc(db, "incidents", id),
    (s) => onData(s.exists() ? { id: s.id, ...s.data() } : null),
    onError
  );

// ฟัง timeline ที่เจ้าหน้าที่บันทึก
export const subscribeTimeline = (id, onData) =>
  onSnapshot(query(collection(db, "incidents", id, "timeline"), orderBy("at", "asc")), (s) =>
    onData(s.docs.map((d) => ({ id: d.id, ...d.data() })))
  );

// ประวัติของผู้ใช้ (ต้องสร้าง composite index: userId + createdAt)
export const subscribeMyIncidents = (uid, onData, onError) =>
  onSnapshot(
    query(collection(db, "incidents"), where("userId", "==", uid), orderBy("createdAt", "desc"), limit(50)),
    (s) => onData(s.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );

// ผู้ใช้ยกเลิกเอง (ได้เฉพาะตอน pending ตาม Security Rules)
export const cancelIncident = async (id) => {
  const batch = writeBatch(db);
  batch.update(doc(db, "incidents", id), { status: STATUS.CANCELLED, updatedAt: serverTimestamp() });
  batch.set(doc(collection(db, "incidents", id, "timeline")), {
    status: STATUS.CANCELLED, note: "ผู้ใช้ยกเลิก", at: serverTimestamp(),
  });
  await batch.commit();
};