console.log('cart.js');

document.querySelector('.btnTorles').addEventListener('click', async (e) => {
  e.preventDefault();
  const cim = e.target.dataset.cim;
  try {
    const result = await fetch(`api/v1/rendeles/cart/${cim}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.log(err);
  }
});
