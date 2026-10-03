import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCy0B8aBsn7v8ZlrTfPOwUEPBVrv8ChNhc",
  authDomain: "kps-ambulance-5308f.firebaseapp.com",
  projectId: "kps-ambulance-5308f",
  storageBucket: "kps-ambulance-5308f.firebasestorage.app",
  messagingSenderId: "911722332967",
  appId: "1:911722332967:web:ef0c31b83f541a4e605f02"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});