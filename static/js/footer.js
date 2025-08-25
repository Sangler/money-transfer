// footer.js
document.addEventListener('DOMContentLoaded', () => {
  const backToTop = document.getElementById('backToTop');

  // Show button when user scrolls down 200px
  window.addEventListener('scroll', () => {
    if (window.scrollY > 200) {
      backToTop.style.display = 'block';
    } else {
      backToTop.style.display = 'none';
    }
  });

  // Smooth scroll to top on click
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
