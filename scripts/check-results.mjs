import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

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

async function run() {
  try {
    await signInWithEmailAndPassword(auth, "admin@fma.com", "password123");
    
    const snap = await getDocs(collection(db, 'cbt_users'));
    const allUsers = snap.docs.map(d => d.data());
    const takenExam = allUsers.filter(u => u.hasTakenExam);
    
    console.log(`Total cbt_users: ${allUsers.length}`);
    console.log(`Users who have taken exam: ${takenExam.length}`);
    
  } catch (err) {
    console.error("Error:", err.message);
  }
  process.exit(0);
}

run();
