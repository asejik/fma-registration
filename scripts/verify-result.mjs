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

async function checkResult(uid) {
  console.log(`Fetching result for UID: ${uid}...`);
  const docRef = doc(db, "cbt_results", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    console.log("Full Result Data:");
    console.log(JSON.stringify(data, null, 2));
    
    const answers = data.answers || {};
    const count = Object.keys(answers).length;
    console.log(`\nFound ${count} answers in the 'answers' field.`);
  } else {
    console.log("❌ No result found for this UID.");
  }
  process.exit(0);
}

const uid = "hTMKO34yUMaOHjzbArJJ6QRjiry2"; // From user screenshot
checkResult(uid);
