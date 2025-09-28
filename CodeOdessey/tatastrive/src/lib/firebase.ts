import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6Uest4K6hUaLDvSB818HEPdoP0I7iYic",
  authDomain: "code-odysessy.firebaseapp.com",
  projectId: "code-odysessy",
  storageBucket: "code-odysessy.firebasestorage.app",
  messagingSenderId: "959834893097",
  appId: "1:959834893097:web:7de1f4c5cc41e693b5a538",
  measurementId: "G-NLQ7FLPDVX"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
