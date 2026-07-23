import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
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
    
    const q = query(collection(db, 'cbt_results'), orderBy('submittedAt', 'desc'));
    const snap = await getDocs(q);
    
    console.log(`Total cbt_results: ${snap.docs.length}`);
    
    if (snap.docs.length > 0) {
      console.log("First result:", snap.docs[0].data());
    }
  } catch (err) {
    console.error("Error fetching results:", err.message);
  }
  process.exit(0);
}

run();
