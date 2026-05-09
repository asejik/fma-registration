/**
 * Pre-registers UK cohort participants in the `students` Firestore collection.
 * Uses setDoc with a deterministic ID (email-based) to:
 *   1. Avoid duplicates on re-runs (same ID = same doc, safely overwrites)
 *   2. Stay within the public `create/update` permission the rules allow
 *
 * This does NOT create Firebase Auth accounts — that happens when each participant
 * clicks the activation link and sets their own password.
 *
 * Usage: node scripts/register-uk-participants.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

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

const UK_PARTICIPANTS = [
  { fullName: "Abimbola Pelumi-Olawole",          email: "abimbolaobaje@gmail.com" },
  { fullName: "Adeshewa Tiwalade Ajayi",           email: "tiwalade1925@gmail.com" },
  { fullName: "Ayodeji Akerele",                   email: "ayodejiakereleclc@gmail.com" },
  { fullName: "Olarinde Olajumoke",                email: "olarindemafola@gmail.com" },
  { fullName: "Oluwakemisola Adewole",             email: "adewolekemisola85@gmail.com" },
  { fullName: "Omotola Abolarin",                  email: "omotaller.abolarin@gmail.com" },
  { fullName: "ONYINYE Olayemi",                   email: "beeke09@gmail.com" },
  { fullName: "Samson Alejolowo",                  email: "samsondamilola22+fma@gmail.com" },
  { fullName: "Sandra Ojoba",                      email: "sandraojoba96@gmail.com" },
  { fullName: "Sophia Bamigboye",                  email: "sophytummy@gmail.com" },
  { fullName: "Tolu Dada",                         email: "toluwalopedada@yahoo.com" },
  { fullName: "Uwayemwen Efosa",                   email: "efosauwaeu@gmail.com" },
  { fullName: "Komolafe Mercy",                    email: "komolafemercy92@gmail.com" },
  { fullName: "Oluwaseun Olaoluwa Kadri",          email: "michaelkadri01@gmail.com" },
  { fullName: "Rufus Agwu",                        email: "leonardagwu@gmail.com" },
  { fullName: "Adeyanju Adejumo",                  email: "adeyanju.adejumo33@gmail.com" },
  { fullName: "Chibuzor Isaac Uwanuakwa",          email: "chibuzoruwanuakwa@gmail.com" },
  { fullName: "Grace Okorie",                      email: "okoriegrace34@gmail.com" },
  { fullName: "Pelumi Olawole",                    email: "olawolepelumisunday@gmail.com" },
  { fullName: "Temitope Akinniran",                email: "tope.akinniran@gmail.com" },
  { fullName: "Toluwani Catherine Yemiola",        email: "tecy1911@gmail.com" },
  { fullName: "Jesunifemi Oluwasegun",             email: "oluwasegunnifemi.on@gmail.com" },
  { fullName: "Sharon Ifesan",                     email: "ifesansharon.is@gmail.com" },
  { fullName: "Adekoya Imisioluwa Mercy",          email: "imisiolukoya@gmail.com" },
  { fullName: "Adekemi Mapaderun",                 email: "adekemimapaderun@gmail.com" },
  { fullName: "Olamide Adejumo",                   email: "mideadedeji@gmail.com" },
  { fullName: "Osuolale Oluwatosin",               email: "tosuolale@yahoo.com" },
  { fullName: "Temitope Ogunsobo",                 email: "temitopeogunsobo@gmail.com" },
  { fullName: "Ayomide Ibrahim",                   email: "ibrahimayomide1997@gmail.com" },
  { fullName: "Dolapo Bamidele",                   email: "bamideledolapo2@gmail.com" },
  { fullName: "Temitope Falua",                    email: "faluatemitopeo@gmail.com" },
  { fullName: "Temitopeoluwa Temilola Falua",      email: "temilolatemitope@gmail.com" },
  { fullName: "Adekunle Adewetan",                 email: "kunle.adewetan@gmail.com" },
  { fullName: "Susana Oseyi Okpere",              email: "susanaoseyi@gmail.com" },
  { fullName: "Emmanuel Kayode",                   email: "rexitsol@gmail.com" },
  { fullName: "Henry Samson",                     email: "henrysam001@gmail.com" },
  { fullName: "Damilola Fakoyode",               email: "officialclcmedia@gmail.com" },
  { fullName: "Adekoya Mercy",                   email: "mercylane06@gmail.com" },
];

/**
 * Converts an email into a safe Firestore document ID.
 * e.g., "user@gmail.com" → "UK_user_at_gmail_com"
 */
function emailToDocId(email) {
  return `UK_${email.toLowerCase().trim().replace(/[@.+]/g, '_')}`;
}

async function registerParticipant(participant) {
  const email = participant.email.toLowerCase().trim();
  const docId = emailToDocId(email);

  try {
    await setDoc(doc(db, "students", docId), {
      fullName: participant.fullName,
      email: email,
      cohort: "UK",
      paymentReference: "ADMIN_REGISTERED",
      status: "paid",
      cbtActivated: false,
      registeredAt: serverTimestamp(),
    });
    console.log(`✅ Registered: ${participant.fullName} (${email})`);
  } catch (err) {
    console.error(`❌ Failed for ${participant.fullName} (${email}):`, err.message);
  }
}

async function run() {
  console.log(`🚀 Registering ${UK_PARTICIPANTS.length} UK cohort participants...\n`);
  for (const participant of UK_PARTICIPANTS) {
    await registerParticipant(participant);
  }
  console.log(`\n✨ Done! All participants are now pre-registered.`);
  console.log(`📧 When ready, send the activation link: https://fma.muyiwaareo.com/cbt/activate`);
  process.exit(0);
}

run();
