const signup = async (email, jelszo, jelszoMegerosites) => {
  try {
    const response = await fetch('/api/v1/users/signup', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify({ email, jelszo, jelszoMegerosites }), // body data type must match "Content-Type" header
    });
    const result = await response.json();
    if (result.status === 'success') {
      location.assign('/paintings');
    }
  } catch (err) {
    alert(err);
  }
};

document
  .querySelector('form.form.form-user-signup')
  .addEventListener('submit', (e) => {
    e.preventDefault();
    document.querySelector(
      '.btn.btn--small.btn--green.btn--signup'
    ).textContent = 'Fiók létrehozása...';
    const email = document.getElementById('email').value;
    const jelszo = document.getElementById('password').value;
    const jelszoMegerosites = document.getElementById('password-confirm').value;
    signup(email, jelszo, jelszoMegerosites);
  });
