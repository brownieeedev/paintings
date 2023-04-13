console.log('hellobeloo');

const img1 = document.querySelector('.img-1');
const img2 = document.querySelector('.img-2');
const img3 = document.querySelector('.img-3');

document.querySelector('.previous').addEventListener('click', () => {
  console.log('clickedPrev');
  if (img1.classList.contains('hidden') & img2.classList.contains('hidden')) {
    img3.classList.add('hidden');
    img2.classList.remove('hidden');
  } else if (
    img2.classList.contains('hidden') & img3.classList.contains('hidden')
  ) {
    img1.classList.add('hidden');
    img3.classList.remove('hidden');
  } else if (
    img1.classList.contains('hidden') & img3.classList.contains('hidden')
  ) {
    img2.classList.add('hidden');
    img1.classList.remove('hidden');
  }
});

document.querySelector('.next').addEventListener('click', () => {
  console.log('clickedNext');
  if (img1.classList.contains('hidden') & img2.classList.contains('hidden')) {
    img3.classList.add('hidden');
    img1.classList.remove('hidden');
  } else if (
    img2.classList.contains('hidden') & img3.classList.contains('hidden')
  ) {
    img1.classList.add('hidden');
    img2.classList.remove('hidden');
  } else if (
    img1.classList.contains('hidden') & img3.classList.contains('hidden')
  ) {
    img2.classList.add('hidden');
    img3.classList.remove('hidden');
  }
});
