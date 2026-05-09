import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPlGnyRA5iHznOn9bBRlbcDb_8XKtW5-0",
  authDomain: "lawig-d81ae.firebaseapp.com",
  projectId: "lawig-d81ae",
  storageBucket: "lawig-d81ae.firebasestorage.app",
  messagingSenderId: "1078198342842",
  appId: "1:1078198342842:web:f5160fa2c1df6dd87dde83"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);