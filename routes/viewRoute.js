const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const rendelesController = require('../controllers/rendelesController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get(
  '/',
  rendelesController.createRendelesCheckout,
  viewsController.getIndex
);
router.get('/paintings', viewsController.getAllPaintings);
router.get('/painting/:slug', viewsController.getPainting);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/rendeleseim', authController.protect, viewsController.getMyOrders);
router.get('/login', viewsController.getLoginForm);
router.get('/sell', authController.isLoggedIn, viewsController.getSellPage);
router.get('/signup', viewsController.signUp);
router.get('/newpassword', viewsController.newPassword);
router.get('/cart', viewsController.getCart);
router.get('/paintings/:query', viewsController.getSpecificPaintings);
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

//router.post('/submit-user-data', viewsController.updateUserData);

module.exports = router;
