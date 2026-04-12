// Script to bulk-create test accounts for the CBT exam
// Usage: node scripts/create-test-accounts.mjs

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

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
const db = getFirestore(app);

const TEST_USERS = [
  { email: "test1@fma.com", name: "Alpha Test", cohort: "Lagos" },
  { email: "test2@fma.com", name: "Bravo Test", cohort: "Ilorin" },
  { email: "test3@fma.com", name: "Charlie Test", cohort: "UK" },
  { email: "test4@fma.com", name: "Delta Test", cohort: "Lagos" },
  { email: "test5@fma.com", name: "Echo Test", cohort: "Ilorin" },
];

const DEFAULT_PASSWORD = "password123";

async function createAccount(user) {
  try {
    console.log(`Creating account for ${user.email}...`);
    
    // 1. Create Auth Account
    const userCredential = await createUserWithEmailAndPassword(auth, user.email, DEFAULT_PASSWORD);
    const uid = userCredential.user.uid;

    // 2. Create student record (so they appear in the main student list)
    await addDoc(collection(db, "students"), {
      fullName: user.name,
      email: user.email,
      cohort: user.cohort,
      paymentReference: "TEST_BYPASS",
      status: "paid",
      cbtActivated: true,
      registeredAt: serverTimestamp(),
    });

    // 3. Create CBT User profile
    await setDoc(doc(db, "cbt_users", uid), {
      uid: uid,
      email: user.email,
      fullName: user.name,
      cohort: user.cohort,
      activatedAt: new Date().toISOString(),
      hasTakenExam: false,
    });

    console.log(`✅ Success for ${user.email} (UID: ${uid})`);
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      console.log(`ℹ️ User ${user.email} already exists. Skipping.`);
    } else {
      console.error(`❌ Error for ${user.email}:`, err.message);
    }
  }
}

async function run() {
  console.log("🚀 Starting test account creation...\n");
  for (const user of TEST_USERS) {
    await createAccount(user);
  }
  console.log("\n✨ Done! All test accounts are ready for login.");
  process.exit(0);
}

run();
