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

window.curriculumSocialDemo = {
    demoUser: {
        uid: "demo-viewer",
        email: "demo@curriculumsocial.com",
        displayName: "Demo",
        role: "parent",
        isDemo: true
    },

    demoProfile: {
        uid: "demo-viewer",
        email: "demo@curriculumsocial.com",
        displayName: "Demo",
        familyName: "Demo",
        role: "parent",
        location: "Koh Samui",
        matchingRadius: 25,
        philosophies: ["montessori", "nature-based", "eclectic"],
        bio: "A sample Koh Samui homeschooling family exploring Curriculum Social."
    },

    demoStudents: [
        {
            id: "demo-student-1",
            name: "Maya",
            age: 7,
            gradeLevel: "Grade 2",
            grade: "Grade 2",
            interests: ["nature", "art", "science"],
            learningStyle: "hands-on"
        },
        {
            id: "demo-student-2",
            name: "Leo",
            age: 5,
            gradeLevel: "Kindergarten",
            grade: "Kindergarten",
            interests: ["music", "animals", "building"],
            learningStyle: "play-based"
        }
    ],

    demoFamilies: [
        {
            id: "demo-family-1",
            familyName: "The Island Learning Family",
            location: "Lamai, Koh Samui",
            philosophies: ["montessori", "nature-based"],
            children: "Ages 5 and 8",
            bio: "A family interested in beach science, nature walks, and small-group learning."
        },
        {
            id: "demo-family-2",
            familyName: "The Fisher Family",
            location: "Bophut, Koh Samui",
            philosophies: ["project-based", "eclectic"],
            children: "Age 6",
            bio: "Looking for other families for weekly field trips and creative learning."
        },
        {
            id: "demo-family-3",
            familyName: "The Santos Family",
            location: "Maenam, Koh Samui",
            philosophies: ["classical", "charlotte mason"],
            children: "Ages 7 and 9",
            bio: "Focused on reading, nature study, music, and community activities."
        }
    ],

    demoActivities: [
        {
            id: "demo-activity-1",
            title: "Beach Nature Walk",
            location: "Lamai Beach",
            date: "Sample Event",
            ageRange: "5-9",
            description: "A relaxed beach walk where kids observe shells, tide pools, and coastal plants."
        },
        {
            id: "demo-activity-2",
            title: "Beginner Music Circle",
            location: "Bophut",
            date: "Sample Event",
            ageRange: "4-10",
            description: "A casual music meetup for kids to sing, clap, play rhythm games, and explore instruments."
        },
        {
            id: "demo-activity-3",
            title: "Jungle Science Morning",
            location: "Maenam",
            date: "Sample Event",
            ageRange: "6-11",
            description: "A hands-on nature session focused on plants, insects, observation, and simple journaling."
        }
    ],

    isDemoUser(user) {
        return !user || user.isDemo === true || user.uid === "demo-viewer";
    },

    activate() {
        window.isDemoMode = true;
        window.currentUser = this.demoUser;
        window.currentUserData = this.demoProfile;
        return this.demoUser;
    },

    showConversionPrompt(actionLabel = "use this feature") {
        let modal = document.getElementById("conversionPromptModal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "conversionPromptModal";
            modal.className = "fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50 px-4";
            modal.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                    <h3 class="text-xl font-bold mb-3" style="color: #1a73e8;">Create an account to use this feature</h3>
                    <p class="text-gray-700 mb-6">You're currently exploring the Curriculum Social demo. Sign up or express interest to save your profile, connect with families, and join activities.</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <a href="signup.html" class="text-center px-4 py-3 rounded-lg font-semibold text-white" style="background-color: #1a73e8;">Sign Up</a>
                        <a href="interest.html" class="text-center px-4 py-3 rounded-lg font-semibold text-white" style="background-color: #34a853;">Express Interest</a>
                    </div>
                    <button type="button" class="w-full text-gray-600 hover:text-gray-800 py-2" data-demo-close>Continue Browsing</button>
                </div>
            `;
            document.body.appendChild(modal);
            modal.addEventListener("click", (event) => {
                if (event.target === modal || event.target.hasAttribute("data-demo-close")) {
                    modal.classList.add("hidden");
                    modal.classList.remove("flex");
                }
            });
        }
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }
};

window.requireRealAccount = function(actionLabel = "use this feature") {
    const isDemo =
        window.isDemoMode === true ||
        window.currentUser?.isDemo === true ||
        window.currentUser?.uid === "demo-viewer";

    if (isDemo) {
        window.curriculumSocialDemo.showConversionPrompt(actionLabel);
        return false;
    }

    return true;
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
