const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const form = document.querySelector('.form');
if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = form.querySelector('button');
    if (button) {
      button.textContent = 'Thanks! We will reach out soon.';
      button.disabled = true;
    }
  });
}
