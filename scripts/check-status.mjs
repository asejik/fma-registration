import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxuVvc5rqOSAxvguUzosw86EmtKWK3zvo",
  authDomain: "fma-registration.firebaseapp.com",
  projectId: "fma-registration",
  storageBucket: "fma-registration.firebasestorage.app",
  messagingSenderId: "580637874716",
  appId: "1:580637874716:web:688ad61225f4bbd5c49dd9",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUser(email) {
  console.log(`Checking registration for: ${email}...`);
  // Note: We can't check cbt_users by email easily without a query, 
  // but we can check if they are in the 'students' collection (pre-registered).
  // The actual redirect happens if they don't have a document in cbt_users.
  console.log("Check complete. (This script is just a placeholder for logic analysis)");
  process.exit(0);
}

checkUser("mercylane06@gmail.com");
