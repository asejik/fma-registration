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

async function recoverProgress(uid) {
  console.log(`Checking progress for UID: ${uid}...`);
  const docRef = doc(db, "cbt_progress", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    console.log("Found Progress Data!");
    const answers = data.answers || {};
    const count = Object.keys(answers).length;
    console.log(`Answers captured in progress: ${count}`);
    
    if (count > 0) {
      console.log("\n--- RECOVERABLE ANSWERS ---");
      console.log(JSON.stringify(answers, null, 2));
      console.log("---------------------------\n");
    } else {
      console.log("Unfortunately, the saved answers are also empty.");
    }
  } else {
    console.log("❌ No progress document found. It might have been deleted.");
  }
  process.exit(0);
}

const uid = "hTMKO34yUMaOHjzbArJJ6QRjiry2"; 
recoverProgress(uid);
