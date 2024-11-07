// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyAG6Qz9D6v90ZewKau16p3dic2FT-i02JI",
  authDomain: "spark-bytes.firebaseapp.com",
  projectId: "spark-bytes",
  storageBucket: "spark-bytes.firebasestorage.app",
  messagingSenderId: "528191245992",
  appId: "1:528191245992:web:a36048c8b728b3b5eabc9d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;