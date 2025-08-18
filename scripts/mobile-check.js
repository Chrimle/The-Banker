
const uaCheck = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const touchCheck = 'ontouchstart' in window;

if (uaCheck || touchCheck) {
  window.location.href = "mobile-landing.html";
}
