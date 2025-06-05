// Firebase configuration and initialization
// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    onAuthStateChanged,
    updateProfile 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    getDocs,
    orderBy,
    limit 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL,
    deleteObject 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCGpQyfbQnPt9RFo0x1CQuVgU7QIL9Mkhk",
    authDomain: "cirriculum-social.firebaseapp.com",
    projectId: "cirriculum-social",
    storageBucket: "cirriculum-social.firebasestorage.app",
    messagingSenderId: "406562436702",
    appId: "1:406562436702:web:a62d8b724d4e9367e526cf",
    measurementId: "G-59G6RC5RNW"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Make Firebase services globally available to all pages
window.firebaseApp = app;
window.auth = auth;
window.db = db;
window.storage = storage;
window.googleProvider = googleProvider;

// Make Firebase functions globally available
window.firebaseAuth = {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile
};

window.firebaseFirestore = {
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    orderBy,
    limit
};

window.firebaseStorage = {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
};

// Utility functions for common operations
window.curriculumSocial = {
    // Create user profile in Firestore
    async createUserProfile(userId, userData) {
        try {
            await setDoc(doc(db, 'users', userId), {
                ...userData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return { success: true };
        } catch (error) {
            console.error('Error creating user profile:', error);
            return { success: false, error: error.message };
        }
    },

    // Get user profile from Firestore
    async getUserProfile(userId) {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                return { success: true, data: userDoc.data() };
            } else {
                return { success: false, error: 'User profile not found' };
            }
        } catch (error) {
            console.error('Error getting user profile:', error);
            return { success: false, error: error.message };
        }
    },

    // Update user profile
    async updateUserProfile(userId, updateData) {
        try {
            await updateDoc(doc(db, 'users', userId), {
                ...updateData,
                updatedAt: new Date()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return { success: false, error: error.message };
        }
    },

    // Upload file to Firebase Storage
    async uploadFile(file, path) {
        try {
            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return { success: true, url: downloadURL };
        } catch (error) {
            console.error('Error uploading file:', error);
            return { success: false, error: error.message };
        }
    },

    // Check authentication status
    getCurrentUser() {
        return auth.currentUser;
    },

    // Sign out user
    async signOut() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Error signing out:', error);
            return { success: false, error: error.message };
        }
    }
};

// Initialize authentication state listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        console.log('User signed in:', user.uid);
        // You can add global user state management here
        window.currentUser = user;
    } else {
        // User is signed out
        console.log('User signed out');
        window.currentUser = null;
    }
});

console.log('Firebase initialized successfully');
