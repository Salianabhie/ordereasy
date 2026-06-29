"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import {
  firebaseClientConfig,
  isFirebaseClientConfigured,
} from "./config";

let clientApp: FirebaseApp | undefined;
let clientDb: Firestore | undefined;

export function getClientDb(): Firestore | null {
  if (!isFirebaseClientConfigured()) return null;

  if (!clientDb) {
    clientApp =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp(firebaseClientConfig);
    clientDb = getFirestore(clientApp);
  }

  return clientDb;
}

export { isFirebaseClientConfigured };
