const listItems = document.querySelectorAll('.pagination ul li');
const currentUrl = window.location.href;

// const numofPaintings = async () => {
//   //nem ezzel lett megoldva a pagination
//   console.log('numofpaintings');
//   try {
//     const response = await fetch('api/v1/paintings', {
//       method: 'GET',
//     });
//     const data = await response.json();
//     const pages = data.pages;
//     return pages;
//   } catch (err) {
//     console.log(err);
//   }
// };

// numofPaintings();

document.querySelector('.btnSearch').addEventListener('click', async (e) => {
  try {
    const query = document.getElementById('searchbar').value;
    if (query !== '' || query.length >= 3) {
      const response = await fetch(`/paintings/${query}`, {
        method: 'GET',
      });
      const result = await response.json();
      if (result.status === 'success') {
        window.location.reload(true);
      }
    }
  } catch (err) {
    console.log(err);
  }
});

listItems.forEach((item) => {
  item.addEventListener('click', () => {
    const value = item.getAttribute('data-value');
    const baseUrl = currentUrl.split('?')[0];
    const newUrl = baseUrl + `?page=${value}`;
    window.location.href = newUrl;
  });
});

document.querySelector('.btn1').addEventListener('click', () => {
  const currentPage = currentUrl.split('=')[1] * 1;
  if (currentPage !== 1) {
    const newUrl = currentUrl.split('?')[0] + `?page=${currentPage - 1}`;
    window.location.href = newUrl;
  }
});

document.querySelector('.btn2').addEventListener('click', () => {
  let currentPage = currentUrl.split('=')[1] * 1;
  if (currentUrl.includes('?')) {
    const newUrl = currentUrl.split('?')[0] + `?page=${currentPage + 1}`;
    window.location.href = newUrl;
  } else {
    currentPage = 1;
    const newUrl = currentUrl + `?page=${currentPage + 1}`;
    window.location.href = newUrl;
  }
});
