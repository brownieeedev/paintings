//const babel = require('@babel/polyfill');
//import axios from '../../node_modules/axios/lib/axios';

const login = async (email, password) => {
  try {
    const response = await fetch('/api/v1/users/login', {
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
      body: JSON.stringify({ email, jelszo: password }), // body data type must match "Content-Type" header
    });
    const result = await response.json();
    if (result.status === 'success') {
      location.assign('/paintings');
    } else {
      console.log(result);
      alert('Helytelen felhasználónév vagy jelszó!');
    }
  } catch (err) {
    alert(err);
  }
};

if (!document.getElementById('form')) {
  console.log('errorr');
} else {
  document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
