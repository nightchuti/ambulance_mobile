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
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
      if (!u) setProfile(null);
      setInitializing(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!authUser) return;
    setProfileLoading(true);
    const unsub = subscribeUserProfile(
      authUser.uid,
      (p) => { setProfile(p); setProfileLoading(false); },
      () => setProfileLoading(false)
    );
    return unsub;
  }, [authUser?.uid]);

  return (
    <UserContext.Provider value={{ authUser, profile, initializing, profileLoading }}>
      {children}
    </UserContext.Provider>
  );
};