import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCBF30oLDAsCRlLfBAcCpwCD24bwxb39LQ",
  authDomain: "flashcard-generator-4366c.firebaseapp.com",
  projectId: "flashcard-generator-4366c",
  storageBucket: "flashcard-generator-4366c.firebasestorage.app",
  messagingSenderId: "129839641091",
  appId: "1:129839641091:web:615f8a91c10180ed131436"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();