<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Firebase Setup - Curriculum Social</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Open+Sans:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-blue: #1a73e8;
            --secondary-blue: #4285f4;
            --primary-green: #34a853;
            --secondary-green: #66bb6a;
            --light-blue: #e8f0fe;
            --light-green: #e6f4ea;
        }
        
        body {
            font-family: 'Open Sans', sans-serif;
            color: #333;
            background: linear-gradient(135deg, #e8f0fe 0%, #e6f4ea 100%);
            min-height: 100vh;
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Montserrat', sans-serif;
        }
        
        .btn-primary {
            background-color: var(--primary-blue);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
        }
        
        .btn-primary:hover {
            background-color: var(--secondary-blue);
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .btn-secondary {
            background-color: var(--primary-green);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
        }
        
        .btn-google {
            background-color: #db4437;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            margin-bottom: 24px;
        }
        
        .input-field {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        .input-field:focus {
            outline: none;
            border-color: var(--primary-blue);
        }
        
        .status-success {
            background-color: #f0f9ff;
            border: 2px solid var(--primary-green);
            color: var(--primary-green);
            padding: 12px;
            border-radius: 8px;
            margin: 12px 0;
        }
        
        .status-error {
            background-color: #fef2f2;
            border: 2px solid #ef4444;
            color: #dc2626;
            padding: 12px;
            border-radius: 8px;
            margin: 12px 0;
        }
        
        .status-info {
            background-color: var(--light-blue);
            border: 2px solid var(--primary-blue);
            color: var(--primary-blue);
            padding: 12px;
            border-radius: 8px;
            margin: 12px 0;
        }
        
        .hidden {
            display: none;
        }
        
        .config-section {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-4 flex items-center justify-between">
            <div class="flex items-center">
                <h1 class="text-2xl font-bold" style="color: var(--primary-blue);">
                    <a href="/" style="text-decoration: none; color: inherit;">
                        <span style="color: var(--primary-green);">Curriculum</span> Social
                    </a>
                </h1>
            </div>
            <div class="text-sm text-gray-600">
                <i class="fas fa-cogs mr-2"></i>Development Setup
            </div>
        </div>
    </header>

    <div class="container mx-auto px-4 py-8 max-w-6xl">
        <!-- Firebase Configuration Section -->
        <div class="config-section">
            <h2 class="text-3xl font-bold mb-6 text-center" style="color: var(--primary-blue);">
                <i class="fas fa-fire mr-3"></i>Firebase Configuration Setup
            </h2>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Configuration Input -->
                <div>
                    <h3 class="text-xl font-semibold mb-4">Firebase Project Configuration</h3>
                    <p class="text-gray-600 mb-4">Enter your Firebase project configuration details. Get these from your Firebase Console → Project Settings → General → Your apps.</p>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">API Key</label>
                            <input type="text" id="apiKey" class="input-field" placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Auth Domain</label>
                            <input type="text" id="authDomain" class="input-field" placeholder="your-project.firebaseapp.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Project ID</label>
                            <input type="text" id="projectId" class="input-field" placeholder="your-project-id">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Storage Bucket</label>
                            <input type="text" id="storageBucket" class="input-field" placeholder="your-project.appspot.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Messaging Sender ID</label>
                            <input type="text" id="messagingSenderId" class="input-field" placeholder="123456789012">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">App ID</label>
                            <input type="text" id="appId" class="input-field" placeholder="1:123456789012:web:abcdef123456789">
                        </div>
                        
                        <button onclick="initializeFirebase()" class="btn-primary w-full">
                            <i class="fas fa-rocket mr-2"></i>Initialize Firebase
                        </button>
                    </div>
                </div>
                
                <!-- Status and Instructions -->
                <div>
                    <h3 class="text-xl font-semibold mb-4">Setup Instructions</h3>
                    
                    <div class="space-y-4">
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-blue-800 mb-2"><i class="fas fa-info-circle mr-2"></i>Step 1: Create Firebase Project</h4>
                            <p class="text-blue-700 text-sm">Go to <a href="https://console.firebase.google.com" target="_blank" class="underline">Firebase Console</a> and create a new project named "curriculum-social"</p>
                        </div>
                        
                        <div class="bg-green-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-green-800 mb-2"><i class="fas fa-check-circle mr-2"></i>Step 2: Enable Authentication</h4>
                            <p class="text-green-700 text-sm">Enable Email/Password and Google sign-in methods in Authentication → Sign-in method</p>
                        </div>
                        
                        <div class="bg-purple-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-purple-800 mb-2"><i class="fas fa-database mr-2"></i>Step 3: Setup Firestore</h4>
                            <p class="text-purple-700 text-sm">Create Firestore database in production mode</p>
                        </div>
                        
                        <div class="bg-orange-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-orange-800 mb-2"><i class="fas fa-cloud mr-2"></i>Step 4: Configure Storage</h4>
                            <p class="text-orange-700 text-sm">Enable Firebase Storage for file uploads</p>
                        </div>
                    </div>
                    
                    <div id="connectionStatus" class="mt-4"></div>
                </div>
            </div>
        </div>

        <!-- Authentication Testing Section -->
        <div class="config-section">
            <h2 class="text-2xl font-bold mb-6" style="color: var(--primary-green);">
                <i class="fas fa-user-shield mr-3"></i>Authentication Testing
            </h2>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Sign Up Form -->
                <div>
                    <h3 class="text-xl font-semibold mb-4">Test User Registration</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">User Type</label>
                            <select id="userType" class="input-field">
                                <option value="parent">Parent</option>
                                <option value="teacher">Teacher</option>
                                <option value="venue">Venue Host</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Full Name</label>
                            <input type="text" id="fullName" class="input-field" placeholder="John Doe">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Email</label>
                            <input type="email" id="signupEmail" class="input-field" placeholder="john@example.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Password</label>
                            <input type="password" id="signupPassword" class="input-field" placeholder="Password (min 6 characters)">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Location (City, Country)</label>
                            <input type="text" id="location" class="input-field" placeholder="Koh Samui, Thailand">
                        </div>
                        
                        <button onclick="signUpUser()" class="btn-primary w-full">
                            <i class="fas fa-user-plus mr-2"></i>Create Test Account
                        </button>
                        
                        <button onclick="signInWithGoogle()" class="btn-google w-full">
                            <i class="fab fa-google mr-2"></i>Sign in with Google
                        </button>
                    </div>
                </div>
                
                <!-- Sign In Form -->
                <div>
                    <h3 class="text-xl font-semibold mb-4">Test User Login</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Email</label>
                            <input type="email" id="loginEmail" class="input-field" placeholder="john@example.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Password</label>
                            <input type="password" id="loginPassword" class="input-field" placeholder="Password">
                        </div>
                        
                        <button onclick="signInUser()" class="btn-secondary w-full">
                            <i class="fas fa-sign-in-alt mr-2"></i>Sign In
                        </button>
                        
                        <button onclick="signOutUser()" class="btn-primary w-full">
                            <i class="fas fa-sign-out-alt mr-2"></i>Sign Out
                        </button>
                        
                        <div id="currentUser" class="mt-4"></div>
                    </div>
                </div>
            </div>
            
            <div id="authStatus" class="mt-6"></div>
        </div>

        <!-- Database Testing Section -->
        <div class="config-section">
            <h2 class="text-2xl font-bold mb-6" style="color: var(--primary-blue);">
                <i class="fas fa-database mr-3"></i>Database Testing
            </h2>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xl font-semibold mb-4">Initialize Database Structure</h3>
                    <p class="text-gray-600 mb-4">Create the initial collections and security rules for the platform.</p>
                    
                    <button onclick="initializeDatabase()" class="btn-primary w-full mb-4">
                        <i class="fas fa-plus-circle mr-2"></i>Create Database Collections
                    </button>
                    
                    <button onclick="testDatabaseOperations()" class="btn-secondary w-full">
                        <i class="fas fa-flask mr-2"></i>Test Read/Write Operations
                    </button>
                </div>
                
                <div>
                    <h3 class="text-xl font-semibold mb-4">Database Status</h3>
                    <div id="databaseStatus"></div>
                    
                    <div class="mt-4">
                        <h4 class="font-medium mb-2">Collections to Create:</h4>
                        <ul class="text-sm text-gray-600 space-y-1">
                            <li><i class="fas fa-users mr-2"></i>users (user profiles and authentication data)</li>
                            <li><i class="fas fa-child mr-2"></i>students (student profiles linked to parents)</li>
                            <li><i class="fas fa-book mr-2"></i>curriculum (learning resources and materials)</li>
                            <li><i class="fas fa-calendar mr-2"></i>activities (social learning events)</li>
                            <li><i class="fas fa-map-marker-alt mr-2"></i>venues (approved learning locations)</li>
                            <li><i class="fas fa-chalkboard-teacher mr-2"></i>sessions (teacher-led sessions)</li>
                            <li><i class="fas fa-comments mr-2"></i>messages (family communications)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Platform Links -->
        <div class="config-section">
            <h2 class="text-2xl font-bold mb-6" style="color: var(--primary-green);">
                <i class="fas fa-link mr-3"></i>Platform Access
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a href="/signup.html" class="btn-primary text-center block">
                    <i class="fas fa-user-plus mr-2"></i>User Signup
                </a>
                <a href="/login.html" class="btn-secondary text-center block">
                    <i class="fas fa-sign-in-alt mr-2"></i>User Login
                </a>
                <a href="/dashboard.html" class="btn-primary text-center block">
                    <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
                </a>
            </div>
        </div>
    </div>

    <!-- Firebase SDKs -->
    <script src="https://cdn.jsdelivr.net/npm/firebase@9.22.0/firebase-app-compat.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/firebase@9.22.0/firebase-auth-compat.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/firebase@9.22.0/firebase-firestore-compat.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/firebase@9.22.0/firebase-storage-compat.min.js"></script>

    <script>
        let firebaseApp = null;
        let auth = null;
        let db = null;
        let storage = null;

        function initializeFirebase() {
            const config = {
                apiKey: document.getElementById('apiKey').value.trim(),
                authDomain: document.getElementById('authDomain').value.trim(),
                projectId: document.getElementById('projectId').value.trim(),
                storageBucket: document.getElementById('storageBucket').value.trim(),
                messagingSenderId: document.getElementById('messagingSenderId').value.trim(),
                appId: document.getElementById('appId').value.trim()
            };

            // Validate configuration
            for (const [key, value] of Object.entries(config)) {
                if (!value) {
                    showStatus('connectionStatus', `Missing ${key}`, 'error');
                    return;
                }
            }

            try {
                // Initialize Firebase
                firebaseApp = firebase.initializeApp(config);
                auth = firebase.auth();
                db = firebase.firestore();
                storage = firebase.storage();

                // Save config to localStorage for persistence
                localStorage.setItem('firebaseConfig', JSON.stringify(config));

                showStatus('connectionStatus', 'Firebase initialized successfully! ✓', 'success');
                
                // Setup auth state listener
                auth.onAuthStateChanged((user) => {
                    updateUserDisplay(user);
                });

            } catch (error) {
                showStatus('connectionStatus', `Firebase initialization failed: ${error.message}`, 'error');
            }
        }

        function signUpUser() {
            if (!auth) {
                showStatus('authStatus', 'Please initialize Firebase first', 'error');
                return;
            }

            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const fullName = document.getElementById('fullName').value;
            const userType = document.getElementById('userType').value;
            const location = document.getElementById('location').value;

            if (!email || !password || !fullName) {
                showStatus('authStatus', 'Please fill in all required fields', 'error');
                return;
            }

            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    
                    // Create user profile in Firestore
                    return db.collection('users').doc(user.uid).set({
                        uid: user.uid,
                        email: email,
                        fullName: fullName,
                        userType: userType,
                        location: location,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        verified: false,
                        profileComplete: false
                    });
                })
                .then(() => {
                    showStatus('authStatus', `Account created successfully for ${email}!`, 'success');
                })
                .catch((error) => {
                    showStatus('authStatus', `Sign up failed: ${error.message}`, 'error');
                });
        }

        function signInUser() {
            if (!auth) {
                showStatus('authStatus', 'Please initialize Firebase first', 'error');
                return;
            }

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    showStatus('authStatus', `Signed in as ${email}!`, 'success');
                })
                .catch((error) => {
                    showStatus('authStatus', `Sign in failed: ${error.message}`, 'error');
                });
        }

        function signInWithGoogle() {
            if (!auth) {
                showStatus('authStatus', 'Please initialize Firebase first', 'error');
                return;
            }

            const provider = new firebase.auth.GoogleAuthProvider();
            
            auth.signInWithPopup(provider)
                .then((result) => {
                    const user = result.user;
                    
                    // Check if user profile exists, create if not
                    return db.collection('users').doc(user.uid).get()
                        .then((doc) => {
                            if (!doc.exists) {
                                return db.collection('users').doc(user.uid).set({
                                    uid: user.uid,
                                    email: user.email,
                                    fullName: user.displayName,
                                    userType: 'parent', // default
                                    location: '',
                                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                    verified: false,
                                    profileComplete: false,
                                    photoURL: user.photoURL
                                });
                            }
                        });
                })
                .then(() => {
                    showStatus('authStatus', 'Google sign-in successful!', 'success');
                })
                .catch((error) => {
                    showStatus('authStatus', `Google sign-in failed: ${error.message}`, 'error');
                });
        }

        function signOutUser() {
            if (!auth) return;

            auth.signOut().then(() => {
                showStatus('authStatus', 'Signed out successfully', 'info');
            });
        }

        function updateUserDisplay(user) {
            const userDiv = document.getElementById('currentUser');
            
            if (user) {
                userDiv.innerHTML = `
                    <div class="status-success">
                        <strong>Signed in as:</strong><br>
                        Email: ${user.email}<br>
                        UID: ${user.uid}<br>
                        Verified: ${user.emailVerified ? 'Yes' : 'No'}
                    </div>
                `;
            } else {
                userDiv.innerHTML = '<div class="status-info">No user signed in</div>';
            }
        }

        function initializeDatabase() {
            if (!db) {
                showStatus('databaseStatus', 'Please initialize Firebase first', 'error');
                return;
            }

            showStatus('databaseStatus', 'Creating database collections...', 'info');

            // Initialize collections with sample data
            const collections = [
                {
                    name: 'users',
                    sampleDoc: {
                        sampleUser: true,
                        created: firebase.firestore.FieldValue.serverTimestamp()
                    }
                },
                {
                    name: 'students',
                    sampleDoc: {
                        sampleStudent: true,
                        created: firebase.firestore.FieldValue.serverTimestamp()
                    }
                },
                {
                    name: 'curriculum',
                    sampleDoc: {
                        sampleCurriculum: true,
                        created: firebase.firestore.FieldValue.serverTimestamp()
                    }
                },
                {
                    name: 'activities',
                    sampleDoc: {
                        sampleActivity: true,
                        created: firebase.firestore.FieldValue.serverTimestamp()
                    }
                },
                {
                    name: 'venues',
                    sampleDoc: {
                        sampleVenue: true,
                        created: firebase.firestore.FieldValue.serverTimestamp()
                    }
                },
                {
                    name: 'sessions',
                    sampleDoc: {
                        sampleSession: true,
                        created: firebase.firestore.FieldValue.serverTimestamp()
                    }
                },
                {
                    name: 'messages',
                    sampleDoc: {
                        sampleMessage: true,
                        created: firebase.firestore.FieldValue.serverTimestamp()
                    }
                }
            ];

            Promise.all(
                collections.map(collection => 
                    db.collection(collection.name).doc('sample').set(collection.sampleDoc)
                )
            ).then(() => {
                showStatus('databaseStatus', 'All collections created successfully! ✓', 'success');
            }).catch((error) => {
                showStatus('databaseStatus', `Database initialization failed: ${error.message}`, 'error');
            });
        }

        function testDatabaseOperations() {
            if (!db) {
                showStatus('databaseStatus', 'Please initialize Firebase first', 'error');
                return;
            }

            showStatus('databaseStatus', 'Testing database operations...', 'info');

            // Test write operation
            const testData = {
                testMessage: 'Hello from Curriculum Social!',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                random: Math.random()
            };

            db.collection('test').add(testData)
                .then((docRef) => {
                    showStatus('databaseStatus', `Write test successful! Document ID: ${docRef.id}`, 'success');
                    
                    // Test read operation
                    return db.collection('test').limit(5).get();
                })
                .then((querySnapshot) => {
                    const docs = querySnapshot.docs.length;
                    showStatus('databaseStatus', `Read test successful! Found ${docs} test documents.`, 'success');
                })
                .catch((error) => {
                    showStatus('databaseStatus', `Database test failed: ${error.message}`, 'error');
                });
        }

        function showStatus(elementId, message, type) {
            const element = document.getElementById(elementId);
            element.innerHTML = `<div class="status-${type}"><i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} mr-2"></i>${message}</div>`;
        }

        // Load saved config on page load
        window.addEventListener('load', () => {
            const savedConfig = localStorage.getItem('firebaseConfig');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                document.getElementById('apiKey').value = config.apiKey || '';
                document.getElementById('authDomain').value = config.authDomain || '';
                document.getElementById('projectId').value = config.projectId || '';
                document.getElementById('storageBucket').value = config.storageBucket || '';
                document.getElementById('messagingSenderId').value = config.messagingSenderId || '';
                document.getElementById('appId').value = config.appId || '';
                
                showStatus('connectionStatus', 'Saved configuration loaded. Click "Initialize Firebase" to connect.', 'info');
            }
        });
    </script>
</body>
</html>
