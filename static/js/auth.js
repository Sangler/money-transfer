document.addEventListener('DOMContentLoaded', ()=>{
  // toggle password visibility
  document.querySelectorAll('.toggle-password').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = document.querySelector(btn.dataset.target);
      if(!target) return;
      if(target.type === 'password'){
        target.type = 'text';
        btn.textContent = 'Hide';
      } else {
        target.type = 'password';
        btn.textContent = 'Show';
      }
    })
  });

  // simple client-side validation hint for auth forms
  document.querySelectorAll('.authenticate-form').forEach(form=>{
    form.addEventListener('submit', e=>{
      const inputs = form.querySelectorAll('input[required]');
      let ok = true;
      inputs.forEach(i=>{
        if(!i.value.trim()){
          i.style.borderColor = '#ef4444';
          ok = false;
        } else {
          i.style.borderColor = '#e6e9ef';
        }
      });
      if(!ok){
        e.preventDefault();
        alert('Please fill in required fields');
      }
    })
  });
});
