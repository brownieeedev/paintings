//const express = require('express');
const Rendeles = require('../models/rendelesModel');
const Painting = require('../models/paintingModel');
const APIFeatures = require('../utils/apiFeatures');
const app = require('../app');
const process = require('process');
const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { store } = require('../utils/mongoStore');

exports.getCheckoutSession = async (req, res, next) => {
  //1) get the painting/paintings?
  const sum = req.params.sum * 1;
  console.log('SUM in the checkout');
  console.log(sum);

  const painting = await Painting.findOne({ cim: 'Koi' });
  console.log(painting);

  //2) create session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?festmenyId=${
      painting.id
    }&felhasznaloId=${req.user.id}&osszeg=${sum}`,
    cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    customer_email: req.user.email,
    // client_reference_id: painting.id,
    line_items: [
      {
        price_data: {
          currency: 'huf',
          product_data: {
            name: 'Végösszeg',
          },
          unit_amount: sum * 100,
        },
        quantity: 1,
      },
    ],
  });
  //Sending response
  res.status(200).json({
    status: 'success',
    sessionId: session.id,
    session,
  });
};

exports.createRendelesCheckout = async (req, res, next) => {
  //kezdetleges megoldás mentésre, nem biztonságos rendelés mentés, mert fel lehetne vinni rendelést fizetés nélkül
  const { festmenyId, felhasznaloId, osszeg } = req.query;
  if (!festmenyId && !felhasznaloId && !osszeg) return next();
  await Rendeles.create({ festmenyId, felhasznaloId, osszeg });

  res.redirect(req.originalUrl.split('?')[0]);
};

exports.removeFromCart = async (req, res) => {
  const userId = req.sessionID;
  const slug = req.params.slug;

  if (!req.session.cart || !req.session.cart[userId]) {
    return res.status(404).json({
      status: 'error',
      message: 'Cart not found',
    });
  }

  // Find the index of the item to remove
  const index = req.session.cart[userId].findIndex(
    (item) => item.slug === slug
  );

  // If the item was not found, return an error
  if (index === -1) {
    return res.status(404).json({
      status: 'error',
      message: 'Item not found in cart',
    });
  }

  // Remove the item from the cart
  req.session.cart[userId].splice(index, 1);

  // Update the cart in the session store
  await store.set(userId, req.session.cart[userId]);

  res.status(200).json({
    status: 'success',
  });
};

exports.addToCart = async (req, res) => {
  const slug = req.params.slug;
  const painting = await Painting.findOne({ slug: slug });
  console.log('FIND PAINTING BY SLUG');
  console.log(painting);

  // Add item to session object
  req.session.cart = req.session.cart || {};
  const userId = req.sessionID;
  if (!Array.isArray(req.session.cart[req.session.userId])) {
    req.session.cart[req.session.userId] = [];
  }
  req.session.cart[req.session.userId].push({
    cim: painting.cim,
    ar: painting.ar,
    kepek: painting.kepek[0],
  });
  console.log('USERID');
  console.log(req.session.userId);
  console.log(req.session.cart[req.session.userId]);

  await store.set(userId, req.session.cart[userId]);

  res.status(200).json({
    status: 'success',
  });
};

//GET
exports.getAllRendeles = catchAsync(async (req, res, next) => {
  //EXECUTE query
  const features = new APIFeatures(Rendeles.find(), req.query)
    .filter()
    .sort()
    .limit()
    .pagination();

  const rendelesek = await features.query;

  res.status(200).json({
    status: 'success',
    results: rendelesek.length,
    data: {
      rendelesek,
    },
  });
});
//POST
exports.createRendeles = catchAsync(async (req, res, next) => {
  const newRendeles = await Rendeles.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { rendeles: newRendeles },
  });
});

//GET by ID
exports.getRendeles = catchAsync(async (req, res, next) => {
  const rendeles = await Rendeles.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      rendeles,
    },
  });
});

//PATCH
exports.updateRendeles = catchAsync(async (req, res, next) => {
  const rendeles = await Rendeles.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'succes',
    rendeles,
  });
});

//DELETE
exports.deleteRendeles = catchAsync(async (req, res, next) => {
  await Rendeles.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
