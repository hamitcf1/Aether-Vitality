import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDqLFPxI21eJRDvtsSjunAaneTbcLBTZjo",
    authDomain: "aether-vitality.firebaseapp.com",
    projectId: "aether-vitality",
    storageBucket: "aether-vitality.firebasestorage.app",
    messagingSenderId: "690721343618",
    appId: "1:690721343618:web:c2e0af8bbb46c4da10cc9b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
