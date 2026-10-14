import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail, deleteUser } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Public browser configuration, copied from the existing Firebase project.
const firebaseConfig = {
    apiKey: "AIzaSyCGpQyfbQnPt9RFo0x1CQuVgU7QIL9Mkhk",
    authDomain: "cirriculum-social.firebaseapp.com",
    projectId: "cirriculum-social",
    storageBucket: "cirriculum-social.firebasestorage.app",
    messagingSenderId: "406562436702",
    appId: "1:406562436702:web:a62d8b724d4e9367e526cf",
    measurementId: "G-59G6RC5RNW"
};

export function createAccountService() {
    const auth = getAuth(initializeApp(firebaseConfig));
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return {
        ready: () => auth.authStateReady(),
        observe: (next, error) => onAuthStateChanged(auth, next, error),
        google: () => signInWithPopup(auth, provider),
        signup: (email, password) => createUserWithEmailAndPassword(auth, email, password),
        login: (email, password) => signInWithEmailAndPassword(auth, email, password),
        logout: () => signOut(auth),
        reset: email => sendPasswordResetEmail(auth, email),
        remove: () => {
            if (!auth.currentUser) throw new Error('Sign in before deleting your account');
            return deleteUser(auth.currentUser);
        }
    };
}
