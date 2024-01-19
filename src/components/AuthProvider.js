import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../firebase';

import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.log(error);
    }
  };

  const value = {
    user,
    setUser,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}