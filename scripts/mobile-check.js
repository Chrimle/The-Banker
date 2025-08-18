
const uaCheck = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const touchCheck = 'ontouchstart' in window;
const sizeCheck = window.innerWidth <= 768;

if (uaCheck || touchCheck || sizeCheck) {
  window.location.href = "mobile-landing.html";
}
