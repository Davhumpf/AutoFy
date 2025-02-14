import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAkplNYHNGSJFaIFb3Nd3jKZ1wJwqr5uWk",
  authDomain: "tsvitereactspotifypage.firebaseapp.com",
  projectId: "tsvitereactspotifypage",
  storageBucket: "tsvitereactspotifypage.firebasestorage.app",
  messagingSenderId: "802280545017",
  appId: "1:802280545017:web:d100be435b5d2d1c2f2028",
  measurementId: "G-5DVMDZBVP2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);