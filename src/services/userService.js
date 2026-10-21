import { doc, getDoc, updateDoc, onSnapshot, serverTimestamp, writeBatch, } from "firebase/firestore";
import { db } from "../firebase/config";

const userRef = (uid) => doc(db, "users", uid);
const privateRef = (uid) => doc(db, "users_private", uid);

export const createUserProfile = async (uid, { idcardSealed, idcardMasked, ...profile }) => {
  const batch = writeBatch(db);
  batch.set(userRef(uid), {
    ...profile,
    idcardMasked,
    photoURL: null,
    photoPublicId: null,
    consent: true,
    consentAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(privateRef(uid), { idcardSealed, createdAt: serverTimestamp() });
  await batch.commit();
};

//เหมือนยังไม่ได้ใช้
export const getUserProfile = async (uid) => {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getUserPrivate = async (uid) => {
  const snap = await getDoc(privateRef(uid));
  return snap.exists() ? snap.data() : null;
};

export const updateUserProfile = (uid, data) =>
  updateDoc(userRef(uid), { ...data, updatedAt: serverTimestamp() });

export const subscribeUserProfile = (uid, onData, onError) =>
  onSnapshot(
    userRef(uid),
    (snap) => onData(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    onError
  );