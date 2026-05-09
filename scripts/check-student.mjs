/**
 * Checks if a specific student exists in Firestore.
 * Usage: node scripts/check-student.mjs henrysam001@gmail.com
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

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

async function check(email) {
  console.log(`Checking for ${email}...`);
  const q = query(collection(db, "students"), where("email", "==", email.toLowerCase().trim()));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log("❌ Not found in students collection.");
  } else {
    console.log(`✅ Found ${snapshot.size} record(s).`);
    snapshot.forEach(doc => {
      console.log("Data:", JSON.stringify(doc.data(), null, 2));
    });
  }
  process.exit(0);
}

const email = process.argv[2];
if (!email) {
  console.log("Please provide an email.");
  process.exit(1);
}
check(email);
