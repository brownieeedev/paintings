console.log('szia');

document.querySelector('.form1').addEventListener('submit', (e) => {
  e.preventDefault();
  console.log(document.getElementById('festo').value);
  console.log(document.getElementById('cim').value);
  console.log(document.getElementById('tipus').value);
  console.log(document.getElementById('meret').value);
  console.log(document.getElementById('ar').value);
  // console.log(document.getElementById('leiras').value);
  const form = new FormData();
  form.append('festo', document.getElementById('festo').value);
  form.append('cim', document.getElementById('cim').value);
  form.append('tipus', document.getElementById('tipus').value);
  form.append('meret', document.getElementById('meret').value);
  form.append('ar', document.getElementById('ar').value);
  let photos = document.getElementById('file').files;
  for (let i = 0; i < photos.length; i++) {
    form.append('file', photos[i]);
    console.log(photos[i]);
  }
  // form.append('leiras', document.getElementById('leiras').value);

  console.log(form);

  createPainting(form);
});

const createPainting = async (form) => {
  try {
    const url = '/api/v1/paintings/upload';
    const response = await fetch(url, {
      method: 'POST',
      body: form,
    });
    const result = await response.json();
    if (result.status === 'success') {
      //location.assign(true);
    }
  } catch (err) {
    console.log(err);
  }
};
