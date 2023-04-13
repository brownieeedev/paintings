const express = require('express');

const paintingsController = require('../controllers/paintingController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router
  .route('/upload')
  .post(
    authController.protect,
    paintingsController.uploadPhoto,
    paintingsController.modifyPaintingPhoto,
    paintingsController.createPainting
  );

router.route('/').get(paintingsController.getAllPaintings);
router
  .route('/:id')
  .get(paintingsController.getPainting)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    paintingsController.updatePainting
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    paintingsController.deletePainting
  );

module.exports = router;
