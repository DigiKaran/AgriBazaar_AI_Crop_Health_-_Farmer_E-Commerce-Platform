
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { firebaseConfig } from "./config";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0]!;
}

auth = getAuth(app);
db = getFirestore(app);

// Attempt to enable offline persistence
try {
  enableIndexedDbPersistence(db, { cacheSizeBytes: CACHE_SIZE_UNLIMITED })
    .then(() => {
      console.log("Firestore offline persistence enabled.");
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn("Firestore offline persistence failed: Multiple tabs open or other precondition not met. This is usually fine, data will be fetched online.");
      } else if (err.code === 'unimplemented') {
        console.warn("Firestore offline persistence failed: Browser does not support all of the features required. Data will be fetched online.");
      } else {
        console.error("Firestore offline persistence failed with error: ", err);
      }
    });
} catch (error) {
    console.error("Error enabling Firestore offline persistence:", error);
}

export { app, auth, db };
