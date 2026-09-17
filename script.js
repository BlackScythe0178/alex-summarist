const modal = document.querySelector('#login-modal');
const form = document.querySelector('#modal-login-form');
const EMAILJS_PUBLIC_KEY = 'Uw7vVYuKaPbSS4-On';
const EMAILJS_SERVICE_ID = 'service_pmc92ju';
const EMAILJS_TEMPLATE_ID = 'template_pbru6g6';

if (window.emailjs && EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
  window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

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

document.querySelectorAll('.js-login').forEach((button) => button.addEventListener('click', openLogin));
document.querySelectorAll('[data-close-login]').forEach((button) => button.addEventListener('click', closeLogin));
document.querySelector('#guest-login').addEventListener('click', () => {
  closeLogin();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.classList.contains('is-open')) closeLogin();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = document.querySelector('.modal-login-form__message');
  if (!window.emailjs || EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') {
    message.textContent = 'Add your EmailJS IDs to enable this form.';
    return;
  }
  window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    user_email: document.querySelector('#modal-email').value,
    action: 'Summarist login request',
    submitted_at: new Date().toISOString()
  }).then(() => {
    message.textContent = 'Request sent.';
  }).catch(() => {
    message.textContent = 'Unable to send the request right now.';
  });
});

document.querySelector('#forgot-password').addEventListener('click', () => {
  document.querySelector('.modal-login-form__message').textContent = 'Password recovery will be added with authentication.';
});

document.querySelector('#create-account').addEventListener('click', () => {
  document.querySelector('.modal-login-form__message').textContent = 'Account creation will be added with authentication.';
});
