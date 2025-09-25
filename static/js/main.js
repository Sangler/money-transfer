// main.js
document.addEventListener('DOMContentLoaded', () => {
  const amountFrom = document.getElementById('amountFrom');
  const amountTo = document.getElementById('amountTo');
  const exchangeRate = 18500; // Replace with live rate logic later

  // Auto-calculate receiving amount with validation and sanitization
  if (amountFrom) {
    amountFrom.setAttribute('step', '0.01');
    amountFrom.addEventListener('input', (e) => {
      let v = e.target.value;
      // allow only digits and single dot
      v = v.replace(/[^0-9.]/g, '');
      const parts = v.split('.');
      if (parts.length > 1) {
        // limit to two decimal places
        parts[1] = parts[1].slice(0, 2);
        // remove leading zeros in integer part but keep single zero
        parts[0] = parts[0].replace(/^0+(?=\d)/, '');
        v = parts[0] + '.' + parts[1];
      } else {
        v = v.replace(/^0+(?=\d)/, '');
      }
      e.target.value = v;

      const sendValue = parseFloat(v);
      if (!isNaN(sendValue)) {
        // clamp to allowed range
        const clamped = Math.min(Math.max(sendValue, 100), 10000);
        amountTo.value = (clamped * exchangeRate).toFixed(2);
      } else {
        amountTo.value = '';
      }
    });

    // on blur, normalize to 2 decimals and enforce range
    amountFrom.addEventListener('blur', (e) => {
      let num = parseFloat(e.target.value);
      if (isNaN(num)) {
        e.target.value = '';
        amountTo.value = '';
        return;
      }
      if (num < 100) num = 100;
      if (num > 10000) num = 10000;
      e.target.value = num.toFixed(2);
      amountTo.value = (num * exchangeRate).toFixed(2);
    });
  }

  // Validate forms before submission
  const exchangeForm = document.getElementById('moneyExchangeForm');
  exchangeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!amountFrom.value || parseFloat(amountFrom.value) <= 0) {
      alert("Please enter a valid sending amount.");
      return;
    }
    alert("Amount calculated. Proceed to transfer section.");
  });

  const transferForm = document.getElementById('transferInfoForm');
  transferForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const requiredFields = transferForm.querySelectorAll('input[required], select[required]');
    let allFilled = true;
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        allFilled = false;
        field.style.borderColor = 'red';
      } else {
        field.style.borderColor = '#ccc';
      }
    });

    if (!allFilled) {
      alert('Please fill out all required fields.');
      return;
    }

    alert('Transfer submitted successfully!');
    transferForm.reset();
  });
});

// Scroll reveal with IntersectionObserver
document.addEventListener('DOMContentLoaded', () => {
  const revealEls = document.querySelectorAll('.scroll-reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          io.unobserve(entry.target);
        }
      });
    }, {threshold: 0.15});
    revealEls.forEach(el => io.observe(el));
  } else {
    // fallback
    revealEls.forEach(el => el.classList.add('active'));
  }

  // tiny UX: smooth internal link scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });
});
