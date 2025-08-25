// main.js
document.addEventListener('DOMContentLoaded', () => {
  const amountFrom = document.getElementById('amountFrom');
  const amountTo = document.getElementById('amountTo');
  const exchangeRate = 18500; // Replace with live rate logic later

  // Auto-calculate receiving amount
  amountFrom.addEventListener('input', () => {
    const sendValue = parseFloat(amountFrom.value);
    if (!isNaN(sendValue)) {
      amountTo.value = (sendValue * exchangeRate).toFixed(2);
    } else {
      amountTo.value = '';
    }
  });

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
