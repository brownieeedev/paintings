const listItems = document.querySelectorAll('.pagination ul li');
const currentUrl = window.location.href;

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
