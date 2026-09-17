// Add your Firebase Web App configuration here.
const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_FIREBASE_AUTH_DOMAIN',
  projectId: 'YOUR_FIREBASE_PROJECT_ID',
  storageBucket: 'YOUR_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'YOUR_FIREBASE_APP_ID'
};

const modal = document.querySelector('#login-modal');
const form = document.querySelector('#modal-login-form');
const firebaseReady = !Object.values(firebaseConfig).some((value) => value.startsWith('YOUR_'));

if (firebaseReady) firebase.initializeApp(firebaseConfig);
const auth = firebaseReady ? firebase.auth() : null;

function openLogin() {
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  document.querySelector('#modal-email').focus();
}

function closeLogin() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function setLoggedIn(label) {
  document.querySelectorAll('.js-login').forEach((button) => {
    button.textContent = label;
    button.classList.add('is-authenticated');
  });
}

document.querySelectorAll('.js-login').forEach((button) => button.addEventListener('click', () => {
  if (auth?.currentUser || localStorage.getItem('summaristGuest') === 'true') return;
  openLogin();
}));

document.querySelectorAll('[data-close-login]').forEach((button) => button.addEventListener('click', closeLogin));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.classList.contains('is-open')) closeLogin();
});

document.querySelector('#guest-login').addEventListener('click', () => {
  localStorage.setItem('summaristGuest', 'true');
  window.location.href = './for-you.html';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!auth) {
    window.alert('Firebase configuration is still needed.');
    return;
  }
  const email = document.querySelector('#modal-email').value.trim();
  const password = document.querySelector('#modal-password').value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = './for-you.html';
  } catch (error) {
    window.alert(error.code === 'auth/invalid-credential'
      ? 'Incorrect email or password.'
      : 'Unable to log in. Check your details and try again.');
  }
});

document.querySelector('#forgot-password').addEventListener('click', async () => {
  const email = document.querySelector('#modal-email').value.trim();
  if (!auth || !email) {
    window.alert('Enter your email first.');
    return;
  }
  try {
    await auth.sendPasswordResetEmail(email);
    window.alert('Password reset email sent.');
  } catch {
    window.alert('Unable to send a reset email.');
  }
});

document.querySelector('#create-account').addEventListener('click', async () => {
  if (!auth) {
    window.alert('Firebase configuration is still needed.');
    return;
  }
  const email = document.querySelector('#modal-email').value.trim();
  const password = document.querySelector('#modal-password').value;
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    window.location.href = './for-you.html';
  } catch (error) {
    window.alert(error.code === 'auth/email-already-in-use'
      ? 'That email already has an account.'
      : 'Use a valid email and a password with at least six characters.');
  }
});

if (auth) auth.onAuthStateChanged((user) => user && setLoggedIn('Logged in'));
if (localStorage.getItem('summaristGuest') === 'true') setLoggedIn('Guest');
