document.getElementById('newpass').addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.querySelector('.form__input').value;
  try {
    const response = await fetch('/api/v1/users/forgotPassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();
    if (result.status === 'success') {
    }
  } catch (err) {
    alert(err);
  }
});
