// One-time script to seed a test student into Firestore
// Usage: node scripts/seed-student.mjs

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

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

const student = {
  fullName: "Sogo Ayenigba",
  email: "asejik@gmail.com",
  cohort: "Ilorin",
  phone: "",
  address: "",
  city: "",
  maritalStatus: "",
  occupation: "",
  paymentReference: "SEED_MANUAL",
  amountPaid: 20000,
  status: "paid",
  currency: "NGN",
  dateString: new Date().toISOString(),
  registeredAt: serverTimestamp(),
};

try {
  const docRef = await addDoc(collection(db, "students"), student);
  console.log("✅ Student created successfully!");
  console.log("   Document ID:", docRef.id);
  console.log("   Name:", student.fullName);
  console.log("   Email:", student.email);
  console.log("   Cohort:", student.cohort);
  console.log("\nYou can now activate the CBT account at /cbt/activate");
  process.exit(0);
} catch (err) {
  console.error("❌ Error creating student:", err.message);
  process.exit(1);
}
