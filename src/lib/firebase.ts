import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Configuration Firebase fournie
const firebaseConfig = {
  apiKey: "AIzaSyA4gGq_Pt0KS1HMUWd5PCQmTmFNHu8TRfs",
  authDomain: "project-e4adac53-21ff-42d2-ab7.firebaseapp.com",
  projectId: "project-e4adac53-21ff-42d2-ab7",
  storageBucket: "project-e4adac53-21ff-42d2-ab7.firebasestorage.app",
  messagingSenderId: "1031989922994",
  appId: "1:1031989922994:web:54934b0c87a51024fe4dab",
  measurementId: "G-TE580ZZF3M"
};

// Initialisation de Firebase
export const app = initializeApp(firebaseConfig);

// L'analytics ne peut être initialisé que côté client (navigateur)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
