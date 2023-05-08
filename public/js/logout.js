// document
//   .querySelector('a.nav__el.nav__el--cta.nav__el--logout.no#logout')
//   .addEventListener('click', () => {
//     console.log('logoutCLicked');
//   });

document
  .querySelector('.nav__el--logout')
  .addEventListener('click', async () => {
    try {
      const response = await fetch('/api/v1/users/logout', {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        // body data type must match "Content-Type" header
      });
      const result = await response.json();
      if (result.status === 'success') {
        location.assign('/paintings');
      } else {
        console.log(result);
        alert('Helytelen felhasználónév, vagy jelszó!');
      }
    } catch (err) {
      alert(err);
    }
  });
