// Ficheiro: src/lib/firebase.ts
// Imports modulares otimizados para reduzir bundle size

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// As tuas credenciais do Firebase a partir de variáveis de ambiente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validação de configuração
const missingKeys = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value && key !== 'measurementId')
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.error('Erro de Configuração Firebase: Faltam as seguintes variáveis de ambiente:', missingKeys);
  throw new Error(`Configuração Firebase em falta: ${missingKeys.join(', ')}. Verifique o ficheiro .env`);
}

// Inicializar a app Firebase de forma segura
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializar Firestore com cache persistente para melhor performance
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Evita inicializar Auth no ambiente Node (scripts) para não exigir API Key válida
let auth: import('firebase/auth').Auth | null = null;
if (typeof window !== 'undefined') {
  try {
    auth = getAuth(app);
  } catch (e) {
    // Ignorar em SSR/scripts
  }
}

const storage = getStorage(app);

export { app, db, auth, storage };