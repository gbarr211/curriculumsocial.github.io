// Forms share one modular Firebase interface. Roles describe participation;
// they never confer administrator, verification or safeguarding privileges.
export function bindAuthForms(w, navigate = url => w.location.assign(url)) {
    const d = w.document;
    const form = d.getElementById('signupForm') || d.getElementById('loginForm');
    if (!form) return;
    const isSignup = form.id === 'signupForm';
    const google = d.getElementById(isSignup ? 'googleSignup' : 'googleLogin');
    const errorBox = d.getElementById('errorMessage');
    const controls = [...form.querySelectorAll('input, select, button'), google].filter(Boolean);
    let busy = false;
    let finished = false;
    let pendingUser = null;
    let pendingProvider = null;

    function showError(text) {
        errorBox.textContent = text;
        errorBox.classList.remove('hidden');
    }
    function setBusy(value) {
        busy = value;
        controls.forEach(control => { control.disabled = value; });
        form.setAttribute('aria-busy', String(value));
    }
    function checkSession(user) {
        if (w.auth.currentUser?.uid !== user.uid) {
            throw Object.assign(new Error(), { code: 'auth/session-changed' });
        }
    }
    function errorText(error) {
        if (error.code === 'profile/unavailable') {
            return isSignup
                ? 'Your account is signed in, but your profile could not be saved or checked. Your information is still here. Try again to finish setup; do not create another account.'
                : 'You are signed in, but your profile could not be loaded. Please try again.';
        }
        if (error.code === 'profile/not-found') {
            return 'You are signed in, but your profile setup is incomplete. Open Sign up to finish setup with the same email.';
        }
        if (error.code === 'auth/session-changed') return 'Your sign-in changed. Please sign in again before continuing.';
        if (['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(error.code)) return 'Sign-in was cancelled. You can try again.';
        if (error.code === 'auth/email-already-in-use') return 'An account already uses this email. Sign in first, then return here to finish setup if needed.';
        if (error.code === 'auth/weak-password') return 'Please choose a password that meets the password requirements.';
        if (error.code === 'auth/network-request-failed') return 'Sign-in could not connect. Check your connection and try again.';
        if (error.code === 'auth/unauthorized-domain') return 'Sign-in is not configured for this website yet. Please try again later.';
        return 'Unable to complete sign-in. Check your details and try again.';
    }
    async function run(provider) {
        if (busy || finished) return;
        errorBox.classList.add('hidden');
        const email = d.getElementById('email').value.trim();
        const password = d.getElementById('password').value;
        const displayName = isSignup ? d.getElementById('displayName').value.trim() : '';
        const role = isSignup ? d.getElementById('role').value : '';
        if (isSignup && !['parent', 'teacher', 'venue'].includes(role)) {
            showError('Choose Parent, Teacher or Venue Host before continuing.');
            return;
        }
        if (provider === 'password' && (!form.checkValidity() || (isSignup && !displayName))) {
            showError('Please complete the required fields.');
            return;
        }
        if (!w.auth || !w.firebaseAuth || !w.curriculumSocial) {
            showError('Sign-in is unavailable right now. Please reload and try again.');
            return;
        }
        setBusy(true);
        try {
            let user;
            if (pendingUser && pendingProvider === provider && w.auth.currentUser?.uid === pendingUser.uid &&
                (provider === 'google' || pendingUser.email?.toLowerCase() === email.toLowerCase())) {
                user = pendingUser;
            } else if (isSignup && provider === 'password' && w.auth.currentUser?.email?.toLowerCase() === email.toLowerCase()) {
                // Recover incomplete setup after reload using the authenticated session.
                user = w.auth.currentUser;
            } else {
                const result = provider === 'google'
                    ? await w.firebaseAuth.signInWithPopup(w.auth, w.googleProvider)
                    : isSignup
                        ? await w.firebaseAuth.createUserWithEmailAndPassword(w.auth, email, password)
                        : await w.firebaseAuth.signInWithEmailAndPassword(w.auth, email, password);
                user = result.user;
            }
            pendingUser = user;
            pendingProvider = provider;
            checkSession(user);
            const existing = await w.curriculumSocial.getUserProfile(user.uid);
            checkSession(user);
            if (!existing.success) {
                // A denied/failed read must never be treated as a missing profile.
                if (existing.code !== 'profile/not-found') throw Object.assign(new Error(), { code: 'profile/unavailable' });
                if (!isSignup) throw Object.assign(new Error(), { code: 'profile/not-found' });
                const name = provider === 'password' ? displayName : (user.displayName || displayName || 'Member');
                if (provider === 'password') await w.firebaseAuth.updateProfile(user, { displayName: name });
                checkSession(user);
                const data = { email: user.email, displayName: name, role, emailVerified: user.emailVerified === true };
                if (user.photoURL) data.photoURL = user.photoURL;
                const saved = await w.curriculumSocial.createUserProfile(user.uid, data);
                if (!saved.success) throw Object.assign(new Error(), { code: 'profile/unavailable' });
                checkSession(user);
            }
            finished = true;
            d.getElementById('password').value = '';
            navigate('dashboard.html');
        } catch (error) {
            showError(errorText(error));
        } finally {
            setBusy(false);
            if (finished) controls.forEach(control => { control.disabled = true; });
        }
    }
    form.addEventListener('submit', event => { event.preventDefault(); void run('password'); });
    google?.addEventListener('click', () => { void run('google'); });
}
