const Painting = require('../models/paintingModel');
const User = require('../models/userModel');
const slugify = require('slugify');
const jsStringify = require('js-stringify');
const admin = require('firebase-admin');
const APIFeatures = require('../utils/apiFeatures');
const Rendeles = require('../models/rendelesModel');

exports.getIndex = (req, res) => {
  res.status(200).render('index');
};

exports.getAllPaintings = async (req, res) => {
  //1) Get all paintings from collection
  const features = new APIFeatures(
    Painting.find({ jovahagyott: true }),
    req.query
  )
    .filter()
    .sort()
    .limit()
    .pagination();

  const paintings = await features.query;
  //2) Get filePaths to pictures
  const bucket = admin.storage().bucket();
  const paintingsWithUrl = await Promise.all(
    paintings.map(async (painting) => {
      const imageURLs = await Promise.all(
        painting.kepek.map(async (kepek) => {
          const [imageURL] = await bucket.file(`images/${kepek}`).getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
          });
          return imageURL;
        })
      );
      const paintingWithImageURL = {
        ...painting.toObject(),
        imageURL: imageURLs,
      };
      return paintingWithImageURL;
    })
  );
  //3)Render that template
  res.status(200).render('paintings', {
    title: 'All paintings',
    paintings: paintingsWithUrl,
    currentPage: 'paintings',
  });
};

exports.getPainting = async (req, res, next) => {
  const painting = await Painting.findOne({ slug: req.params.slug });
  if (!painting) {
    res.status(404).send('Not found');
    return next();
  }
  //get store picture urls
  const bucket = admin.storage().bucket();

  const imageURLs = await Promise.all(
    painting.kepek.map(async (kepek) => {
      const [imageURL] = await bucket.file(`images/${kepek}`).getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });
      return imageURL;
    })
  );
  const paintingWithImageURL = {
    ...painting.toObject(),
    imageURL: imageURLs,
  };
  let index = 0;
  res.status(200).render('painting', {
    title: 'Festmény',
    painting: paintingWithImageURL,
    index,
  });
};

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Bejelentkezés',
    currentPage: 'login',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Account',
  });
};

exports.getSellPage = (req, res) => {
  res.status(200).render('sell', {
    title: 'Eladás',
  });
};

exports.updateUserData = async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      nev: req.body.nev,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render('account', {
    title: 'Account',
    user: updatedUser,
  });
};

exports.signUp = (req, res) => {
  res.status(200).render('signup', {
    title: 'Feliratkozás',
    currentPage: 'signup',
  });
};

exports.newPassword = (req, res) => {
  res.status(200).render('newpassword', {
    title: 'newpass',
    currentPage: 'newpass',
  });
};

exports.getCart = async (req, res) => {
  const paintings = Object.values(req.session.cart || {}).flat();
  //2) Get filePaths to pictures
  const bucket = admin.storage().bucket();
  let sum = 0;
  for (let i = 0; i < paintings.length; i++) {
    const kep = paintings[i].kepek;
    if (kep.split('.')[1] === 'jpg') {
      const [imageURL] = await bucket.file(`images/${kep}`).getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 24 * 7 * 60 * 60 * 1000,
      });
      paintings[i].kepek = imageURL;
    }
    //összeg
    sum += paintings[i].ar;
  }
  const afa = sum * 0.27;
  const reszosszeg = sum - afa;

  res.status(200).render('cart', {
    title: 'cart',
    currentPage: 'cart',
    paintings: paintings,
    sum,
    reszosszeg,
    afa,
  });
};

exports.getMyOrders = async (req, res) => {
  //1) minden rendeles
  console.log(req.user.id);
  const rendelesek = await Rendeles.find({ felhasznaloId: req.user.id });
  console.log(rendelesek);
  const festmenyIds = rendelesek.map((el) => el.festmenyId);
  const paintings = await Painting.find({ _id: { $in: festmenyIds } });

  //képek lekérése
  //2) Get filePaths to pictures
  const bucket = admin.storage().bucket();
  const paintingsWithUrl = await Promise.all(
    paintings.map(async (painting) => {
      const imageURLs = await Promise.all(
        painting.kepek.map(async (kepek) => {
          const [imageURL] = await bucket.file(`images/${kepek}`).getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
          });
          return imageURL;
        })
      );
      const paintingWithImageURL = {
        ...painting.toObject(),
        imageURL: imageURLs,
      };
      return paintingWithImageURL;
    })
  );

  res.status(200).render('paintings', {
    title: 'Festmenyeim',
    currentPage: 'paintings',
    paintings: paintingsWithUrl,
  });
};
