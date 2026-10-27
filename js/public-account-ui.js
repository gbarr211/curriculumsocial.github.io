function eventDestination(search){const id=new URLSearchParams(search||'').get('event');return '/events.html'+(id&&/^[A-Za-z0-9_-]{8,64}$/.test(id)?'?event='+encodeURIComponent(id):'');}
function familyDestination(hash){const p=new URLSearchParams((hash||'').replace(/^#/,'')),owner=p.get('family'),token=p.get('invite');return '/invitations.html'+(/^[A-Za-z0-9_-]{1,128}$/.test(owner||'')&&/^[A-Za-z0-9_-]{32}$/.test(token||'')?'#'+new URLSearchParams({family:owner,invite:token}):'');}
function prepareAccountNavigation(d) {
    const location = d.defaultView?.location;
    if (!location || d.body?.dataset.memberRedirect !== 'true') return '/member.html';
    const params = new URLSearchParams(location.search), kind = params.get('continue');
    const destinations = {events: eventDestination(location.search), contributions: '/contributions.html', introductions: '/introductions.html', family: familyDestination(location.hash)};
    const destination = Object.hasOwn(destinations, kind) ? destinations[kind] : '/member.html';
    const recovery = new URLSearchParams();
    if (Object.hasOwn(destinations, kind)) recovery.set('continue', kind);
    if (kind === 'events' && destination.includes('?')) recovery.set('event', new URLSearchParams(destination.split('?')[1]).get('event'));
    const reload = d.querySelector('#reload-account a');
    // Prepare before the SDK loads: a failed startup must retain the invitation.
    // Only known in-app destinations survive; arbitrary redirect URLs do not.
    if (reload) reload.setAttribute('href', location.pathname + (recovery.size ? '?' + recovery.toString() : '') + (kind==='family'&&destination.includes('#')?'#'+destination.split('#')[1]:''));
    if (reload) reload.onclick = event => {
        const target = new URL(reload.getAttribute('href'), location.href);
        // A fragment-only link does not reload a failed SDK. Preserve the
        // canonical private invitation fragment, then explicitly retry startup.
        if (target.pathname === location.pathname && target.search === location.search) {
            event.preventDefault();
            d.defaultView.history.replaceState(null, '', target.pathname + target.search + target.hash);
            location.reload();
        }
    };
    if (Object.hasOwn(destinations, kind)) {
        let context = d.getElementById('account-destination');
        if (!context) { context = d.createElement('p'); context.id = 'account-destination'; context.className = 'fine-print'; d.getElementById('account-status')?.before(context); }
        context.textContent = kind === 'family' ? 'After sign-in, return to Invitations.' : kind === 'events' ? (destination.includes('?') ? 'After sign-in, return to this gathering.' : 'After sign-in, explore Events.') : kind === 'contributions' ? 'After sign-in, explore Contributions.' : 'After sign-in, return to Introductions.';
    }
    return destination;
}
if (typeof document !== 'undefined') prepareAccountNavigation(document);
// Adult authentication only. No profile, interest, reviewer, or child data access.
export function bindPublicAccount(d, service, navigate = path => d.defaultView.location.replace(path)) {
    const destination = prepareAccountNavigation(d);
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
            'member/family-memberships':'Leave your shared families or close the family access you manage before deleting your account. Open Invitations to manage membership.',
            'member/events-hosted':'Cancel and delete your hosted gatherings in Events before deleting your account.',
            'member/event-rsvps':'Leave and delete your household RSVPs in Events before deleting your account.',
            'member/introductions-exist':'Delete your introductions before deleting your account. Open Introductions to manage both inboxes.',
            'member/blocks-exist':'Clear your blocked-adult list in Introductions before deleting your account.',
            'member/contributions-exist': 'Delete your contributions before deleting your account. Open My contributions to manage them.',
        'member/profile-exists': 'Delete your saved profile from your member home before deleting your sign-in account.',
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
        if (d.body.dataset.accountSettings === 'true') {
            get('account-title').textContent = signedIn ? 'Account settings.' : 'Sign in to your account.';
            const intro = get('account-intro');
            if (intro) intro.textContent = signedIn ? 'Your name and sign-in details.' : 'Sign in to manage your name and sign-in details.';
        }
        if (signedIn && d.body.dataset.memberRedirect === 'true') navigate(destination);
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
