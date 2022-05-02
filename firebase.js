import { initializeApp } from "firebase/app";
import {
  getAuth,
} from "firebase/auth";
import { getStorage, ref } from "firebase/storage";
import { getFirestore, } from "firebase/firestore";
import Constants from "expo-constants";

const app = initializeApp(Constants.manifest.extra.firebase);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage();
const refFirebase = ref(storage);


export { auth, db, storage, refFirebase };
