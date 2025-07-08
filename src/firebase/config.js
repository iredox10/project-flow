
import { initializeApp } from "firebase/app";
import {
 getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import {
  arrayUnion,
  orderBy,
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7s26pqpe4fHQtcPNn_QSWBo49M-45CP4",
  authDomain: "project-flow-d60f7.firebaseapp.com",
  projectId: "project-flow-d60f7",
  storageBucket: "project-flow-d60f7.firebasestorage.app",
  messagingSenderId: "1052408204196",
  appId: "1:1052408204196:web:266d537ade6167b1aecf31",
  measurementId: "G-B597ZK7M7G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export services
const auth = getAuth(app);
const db = getFirestore(app);
// Add this to your src/firebase/config.js file

export const createNotification = async (userId, type, text, link) => {
  await addDoc(collection(db, "notifications"), {
    userId, // The ID of the user who will receive the notification
    type,   // e.g., 'approval', 'feedback', 'submission'
    text,
    link,   // A URL to the relevant page
    read: false,
    createdAt: serverTimestamp()
  });
};

// Export all the services and functions needed across the app
export {
  db,
  auth,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  writeBatch,
  createUserWithEmailAndPassword,
  serverTimestamp,
  orderBy,
    EmailAuthProvider,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  updatePassword,
  arrayUnion
};
