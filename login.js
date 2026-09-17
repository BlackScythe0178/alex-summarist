document.querySelector('.login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('.login-form__message').textContent =
    'Login will be connected when authentication is added.';
});
