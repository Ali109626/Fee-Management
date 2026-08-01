
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

let config: any;
try {
  const glob = import.meta.glob('/firebase-applet-config.json', { eager: true }) as Record<string, any>;
  config = glob['/firebase-applet-config.json']?.default || glob['/firebase-applet-config.json'];
} catch (e) {}

if (!config) {
  config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDpkkdEODalAldKnBvDPVzApM8l3CBNSL4",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fee-management-system-b5a9a.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fee-management-system-b5a9a",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fee-management-system-b5a9a.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "244883328904",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:244883328904:web:ac79dcea153593e79bb43d",
    firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)"
  };
}

export const isFirebaseConfigured = !!config && !!config.apiKey;

let app: any;
let auth: any;
let db: any;

if (isFirebaseConfigured) {
  app = initializeApp(config);
  auth = getAuth(app);
  db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);
  if (typeof window !== 'undefined') {
    getAnalytics(app);
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return new Error(JSON.stringify(errInfo));
}

export { auth, db };

