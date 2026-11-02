'use strict';

// Native links and disclosures remain usable if JavaScript is unavailable.
const navLinks = [...document.querySelectorAll('.nav a[href^="#"]')];
const sections = navLinks.map(link => document.querySelector(link.hash));
const backToTop = document.querySelector('.back-to-top');
let framePending = false;

function updateNavigation() {
  framePending = false;
  const marker = Math.min(180, window.innerHeight * 0.3);
  let current = -1;
  sections.forEach((section, index) => {
    if (section && section.getBoundingClientRect().top <= marker) current = index;
  });
  // A short final section may never reach the marker before the page ends.
  if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) {
    current = sections.length - 1;
  }
  navLinks.forEach((link, index) => {
    if (index === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  if (backToTop) backToTop.hidden = window.scrollY < window.innerHeight * 0.7;
}

function scheduleNavigation() {
  if (!framePending) {
    framePending = true;
    window.requestAnimationFrame(updateNavigation);
  }
}
window.addEventListener('scroll', scheduleNavigation, { passive: true });
window.addEventListener('resize', scheduleNavigation);
window.addEventListener('load', scheduleNavigation);
updateNavigation();

const details = [...document.querySelectorAll('.project-details')];
const detailsToggle = document.querySelector('.details-toggle');

function updateDetailsButton() {
  if (!detailsToggle) return;
  const allOpen = details.every(detail => detail.open);
  detailsToggle.replaceChildren(document.createTextNode(allOpen ? 'Collapse project details ' : 'Expand project details '));
  const symbol = document.createElement('span');
  symbol.setAttribute('aria-hidden', 'true');
  symbol.textContent = allOpen ? '−' : '+';
  detailsToggle.append(symbol);
}

if (detailsToggle && details.length) {
  detailsToggle.hidden = false;
  detailsToggle.addEventListener('click', () => {
    const expand = !details.every(detail => detail.open);
    details.forEach(detail => { detail.open = expand; });
    updateDetailsButton();
    scheduleNavigation();
  });
  details.forEach(detail => detail.addEventListener('toggle', () => {
    updateDetailsButton();
    scheduleNavigation();
  }));
  updateDetailsButton();
}

// Include the full evidence in printouts, then restore the reader's choices.
let printState = null;
window.addEventListener('beforeprint', () => {
  if (printState) return;
  printState = details.map(detail => detail.open);
  details.forEach(detail => { detail.open = true; });
});
window.addEventListener('afterprint', () => {
  if (!printState) return;
  details.forEach((detail, index) => { detail.open = printState[index]; });
  printState = null;
  updateDetailsButton();
});
