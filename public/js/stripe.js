console.log('stripee');
const stripe = Stripe(
  'pk_test_51MubC3AMv0hvlS1F0AdQEoPGuidHGQ6cvew200XINrsWdbQIOyAeFApsKxyXnFTyFOoICZRPFxx8Jb7GogrjYFCP00kGHwYUh1'
);

document
  .querySelector('.btn--checkout')
  .addEventListener('click', async (e) => {
    console.log('clicked');
    e.target.textContent = 'Feldolgozás...';
    const sum = e.target.dataset.sum;
    console.log(sum);
    //checkout session from api endpoint
    try {
      console.log('try');
      const session = await fetch(`api/v1/rendeles/checkout-session/${sum}`, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        headers: {
          'Content-Type': 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const { sessionId } = await session.json();
      //2)create checkout form
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.log(err);
    }
  });
