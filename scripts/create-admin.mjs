// One-time script to create the CBT Admin user in Firebase Auth
// Usage: node scripts/create-admin.mjs

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDxuVvc5rqOSAxvguUzosw86EmtKWK3zvo",
  authDomain: "fma-registration.firebaseapp.com",
  projectId: "fma-registration",
  storageBucket: "fma-registration.firebasestorage.app",
  messagingSenderId: "580637874716",
  appId: "1:580637874716:web:688ad61225f4bbd5c49dd9",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const adminEmail = "admin@fma.com";
const adminPassword = "password123";

try {
  console.log(`Attempting to create admin account: ${adminEmail}...`);
  const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
  console.log("✅ Admin account created successfully!");
  console.log("   UID:", userCredential.user.uid);
  process.exit(0);
} catch (err) {
  if (err.code === 'auth/email-already-in-use') {
    console.log("ℹ️ Admin account already exists. Updating password...");
    try {
        const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log("✅ Admin password verified.");
        process.exit(0);
    } catch (innerErr) {
        console.error("❌ Error: account exists but password update failed.", innerErr.message);
        process.exit(1);
    }
  } else {
    console.error("❌ Error creating admin:", err.message);
    process.exit(1);
  }
}
