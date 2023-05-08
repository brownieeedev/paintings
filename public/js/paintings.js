const buttons = document.querySelectorAll('.btn--cart');
buttons.forEach((button) => {
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    const slug = button.dataset.slug;
    try {
      const response = await fetch(`api/v1/rendeles/cart/add/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (result.status === 'success') {
        console.log('success');
      }
    } catch (err) {
      console.log(err);
    }
  });
});
