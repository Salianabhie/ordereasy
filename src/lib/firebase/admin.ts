import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { isFirebaseAdminConfigured } from "./config";

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

export function getAdminDb(): Firestore {
  if (!isFirebaseAdminConfigured()) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env"
    );
  }

  if (!adminDb) {
    if (!getApps().length) {
      const rawKey = process.env.FIREBASE_PRIVATE_KEY!;
      const privateKey = rawKey
        .replace(/^["']|["']$/g, "") // remove surrounding quotes if present
        .replace(/\\n/g, "\n"); // parse literal \n sequences into actual newlines

      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey,
        }),
      });
    }
    adminDb = getFirestore(getApps()[0] ?? adminApp!);
  }

  return adminDb;
}

export function restaurantRef(slug: string) {
  return getAdminDb().collection("restaurants").doc(slug);
}
