//type is either password, or data

const updateSetting = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';
    const response = await fetch(url, {
      method: 'PATCH', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    const result = await response.json();
  } catch (err) {
    alert(err);
  }
};

document
  .querySelector('form.form.form-user-data')
  .addEventListener('submit', (e) => {
    e.preventDefault();
    const nev = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateSetting({ nev, email }, 'data');
  });

document
  .querySelector('.form.form-user-settings')
  .addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Mentés...';

    const jelszoJelenlegi = document.getElementById('password-current').value;
    const jelszo = document.getElementById('password').value;
    const jelszoMegerosites = document.getElementById('password-confirm').value;
    const jsonData = {
      jelszoJelenlegi: jelszoJelenlegi,
      jelszo: jelszo,
      jelszoMegerosites: jelszoMegerosites,
    };
    await updateSetting({ jsonData }, 'password');

    document.querySelector('.btn--save-password').textContent =
      'Jelszó mentése';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

document.querySelector('.form-input-name').addEventListener('click', () => {
  const element = document.getElementById('name');
  const teljesnev = element.value;
  if (teljesnev === 'Adja meg a nevét') {
    element.value = '';
  }
});
