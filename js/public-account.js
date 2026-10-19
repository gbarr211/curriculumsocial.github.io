import { bindPublicAccount } from './public-account-ui.js?v=events-pilot-20261019';

// Dynamic loading lets the page explain a blocked SDK instead of staying on
// "Loading sign-in" forever. Never load the legacy Firestore/profile module here.
export async function startPublicAccount(d, loadService, timeoutMs = 15000) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Sign-in loading timed out')), timeoutMs);
    });
    try {
        const service = await Promise.race([loadService(), timeout]);
        // Wait before binding: a late restored session after a timeout must not
        // silently re-enable a form that has already reported startup failure.
        await Promise.race([service.ready(), timeout]);
        await bindPublicAccount(d, { ...service, ready: () => Promise.resolve() });
    } catch {
        d.getElementById('account-status').textContent = 'Sign-in could not load. Check your connection, then reload this page to try again.';
        d.getElementById('reload-account').hidden = false;
        d.getElementById('account-controls').disabled = true;
        d.querySelectorAll('#signed-in button').forEach(button => { button.disabled = true; });
    } finally {
        clearTimeout(timer);
    }
}

if (typeof document !== 'undefined') {
    // The existing, public Firebase client configuration belongs to the service.
    void startPublicAccount(document, async () => {
        const { createAccountService } = await import('./public-account-service.js');
        return createAccountService();
    });
}
