// Adult authentication only. No profile, interest, reviewer, or child data access.
export function bindPublicAccount(d, service) {
    const get = id => d.getElementById(id);
    let ready = false;
    let busy = false;
    let signedIn = false;
    const feedback = d.createElement('p');
    feedback.id = 'account-feedback';
    feedback.hidden = true;
    feedback.setAttribute('role', 'alert');
    get('submit-account').closest('.actions').before(feedback);
    get('password').setAttribute('aria-describedby', 'account-feedback');
    const message = (text, failed = false) => {
        get('account-status').textContent = text;
        get('account-status').classList.toggle('is-error', failed);
        feedback.textContent = failed ? text : '';
        feedback.hidden = !failed;
    };
    const controls = () => {
        get('account-controls').disabled = !ready || busy;
        d.querySelectorAll('#signed-in button').forEach(button => {
            button.disabled = !ready || busy;
        });
        get('account-form').setAttribute('aria-busy', String(busy));
    };
    const error = e => {
        const messages = {
            'auth/requires-recent-login': 'Please sign out and sign in again before deleting your account.',
            'auth/email-already-in-use': 'Please sign in with your existing account or reset your password.',
            'auth/unauthorized-domain': 'Sign-in is not configured for this address yet. Please try the public website.',
            'auth/popup-blocked': 'Your browser blocked Google sign-in. Allow the popup, or use email and password.',
            'auth/popup-closed-by-user': 'Google sign-in was cancelled. You can try again or use email and password.',
            'auth/cancelled-popup-request': 'Google sign-in was cancelled. Please try again.',
            'auth/invalid-credential': 'The email or password was not accepted. Try again or reset your password.',
            'auth/invalid-login-credentials': 'The email or password was not accepted. Try again or reset your password.',
            'auth/wrong-password': 'The email or password was not accepted. Try again or reset your password.',
            'auth/user-not-found': 'The email or password was not accepted. Try again or reset your password.',
            'auth/weak-password': 'Choose a stronger password with at least six characters.',
            'auth/too-many-requests': 'Too many attempts. Please wait a little before trying again.',
            'auth/network-request-failed': 'Could not connect to sign-in. Check your connection and try again.'
        };
        message(messages[e?.code] || 'Could not complete this action. Check your connection and details, then try again.', true);
    };
    function updateMode() {
        const signup = get('mode').value === 'signup';
        get('account-title').textContent = signup ? 'Create your account.' : 'Welcome back.';
        get('submit-account').textContent = signup ? 'Create account' : 'Sign in';
        get('password').autocomplete = signup ? 'new-password' : 'current-password';
        if (signup) get('password').setAttribute('minlength', '6');
        else get('password').removeAttribute('minlength');
        get('consent').required = signup;
        get('consent-row').hidden = false;
        get('login-notice').hidden = signup;
    }
    async function run(action, success) {
        if (!ready || busy) return;
        busy = true;
        controls();
        message('Working…');
        try {
            // Invoke synchronously so Google retains the browser's click gesture.
            await action();
            if (success) message(success);
        } catch (e) {
            error(e);
        } finally {
            busy = false;
            controls();
        }
    }
    updateMode();
    controls();
    get('mode').addEventListener('change', updateMode);
    service.observe(user => {
        signedIn = Boolean(user);
        get('signed-out').hidden = signedIn;
        get('signed-in').hidden = !signedIn;
        get('identity').textContent = user?.email || 'your account';
        get('password').value = '';
        get('delete-confirm').hidden = true;
        message(signedIn ? 'You are signed in. Your adult account is ready.' : 'Sign in or create an adult account.');
    }, error);
    get('account-form').addEventListener('submit', e => {
        e.preventDefault();
        if (!ready || busy || !get('account-form').reportValidity()) return;
        const email = get('email').value.trim();
        const password = get('password').value;
        const mode = get('mode').value;
        if (mode !== 'signup' && mode !== 'login') return;
        void run(async () => {
            await service[mode](email, password);
            get('password').value = '';
        });
    });
    get('google').addEventListener('click', () => {
        // Google sign-in can create a new account even from the login mode.
        if (!get('consent').checked) {
            get('consent-row').hidden = false;
            message('To continue with Google, tick the adult account notice above, then select Continue with Google again.', true);
            get('consent').focus();
            return;
        }
        void run(() => service.google());
    });
    get('logout').addEventListener('click', () => void run(() => service.logout(), 'Signed out.'));
    get('reset').addEventListener('click', () => {
        if (!get('email').reportValidity()) return;
        const email = get('email').value.trim();
        void run(async () => {
            try { await service.reset(email); }
            catch (e) { if (e?.code !== 'auth/user-not-found') throw e; }
        }, 'If this address supports password recovery, check its inbox for reset instructions.');
    });
    get('delete-account').addEventListener('click', () => {
        if (!signedIn || busy) return;
        get('delete-confirm').hidden = false;
        get('cancel-delete').focus();
    });
    get('cancel-delete').addEventListener('click', () => {
        get('delete-confirm').hidden = true;
        get('delete-account').focus();
    });
    get('confirm-delete').addEventListener('click', () => {
        if (!signedIn || get('delete-confirm').hidden) return;
        void run(() => service.remove(), 'Your sign-in account was deleted.');
    });
    return Promise.resolve().then(() => service.ready()).then(() => {
        ready = true;
        controls();
    });
}
