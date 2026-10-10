import './firebase-config.js';
import { bindAuthForms } from './auth-forms.js';

// Module dependencies finish before forms become interactive.
bindAuthForms(window);
