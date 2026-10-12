import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { subscribeUserProfile } from "../services/userService";

const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);

  //ติดตามสถานะล็อกอิน
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setInitializing(false);
    });
  }, []);

  //แสดงโปรไฟล์ จะถูกเรียกเมื่อข้อมูลเปลี่ยน
  useEffect(() => {
    if (!authUser) {
      setProfile(null);
      return;
    }
    return subscribeUserProfile(authUser.uid, setProfile);
  }, [authUser?.uid]);

  return (
    <UserContext.Provider value={{ authUser, profile, initializing }}>
      {children}
    </UserContext.Provider>
  );
};