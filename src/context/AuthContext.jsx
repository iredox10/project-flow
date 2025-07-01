
import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// Create the context
const AuthContext = createContext();

// Create a custom hook to easily use the context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for changes in authentication state (login/logout)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, fetch their profile from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          // Combine auth data with Firestore data (name, role, etc.)
          setCurrentUser({ ...user, ...userDoc.data() });
        } else {
          // Fallback if there's no Firestore document
          setCurrentUser(user);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
  };

  // Render children only after the initial auth check is complete
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
