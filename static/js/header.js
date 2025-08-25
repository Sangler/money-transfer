// header.js
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Toggle nav links on mobile when hamburger icon is clicked
  toggle.addEventListener('click', () => {
    if (navLinks.style.display === 'flex') {
      navLinks.style.display = 'none';

    } else {
      navLinks.style.display = 'flex';
    }
  });
  
  window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

});