const { promisify } = require('util');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
// const sendEmail = require('../utils/email');
const crypto = require('crypto');
const { Email, Email2 } = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions =
    ('jwt',
    token,
    {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      //secure: true, //cookie will only be sent on encrypted (https)
      httpOnly: true,
    });
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  //Remove password from output
  user.jelszo = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

exports.signup = async (req, res) => {
  const newUser = await User.create({
    nev: req.body.nev,
    email: req.body.email,
    lakcim: req.body.lakcim,
    telszam: req.body.telszam,
    festmenyekSzama: req.body.festmenyekSzama,
    regisztracioDatuma: req.body.regisztracioDatuma,
    jelszo: req.body.jelszo,
    jelszoMegerosites: req.body.jelszoMegerosites,
    jelszoMegvaltoztatva: req.body.jelszoMegvaltoztatva,
    role: req.body.role,
  });
  const url1 = `${req.protocol}://${req.get('host')}/paintings`;
  const url2 = `${req.protocol}://${req.get('host')}/sell`;
  await new Email(newUser, url1, url2).sendWelcome();
  createSendToken(newUser, 201, res);
};

exports.login = async (req, res) => {
  const { email, jelszo } = req.body;

  //1) email és jelszó létezik-e
  if (!email || !jelszo) {
    res.status(400).send('Please provide email and password!');
  }
  //2)megnézni h létezik e felhasználó és a jelszava megegyezik e
  const user = await User.findOne({ email }).select('+jelszo');

  if (!user || !(await user.correctPassword(jelszo, user.jelszo))) {
    return res.status(401).json({ message: 'Incorrect email or password' });
  }

  //3) ha minden jó token küldése a kliensnek
  try {
    await req.session.save();
    req.session.userId = user.id;
  } catch (err) {
    console.log(err);
  }
  createSendToken(user, 200, res);
};

// exports.logoutSession = (req, res) => {
//   //destroying session cookie
//   req.session.destroy((err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       res.clearCookie('connect.sid'); // clear the session cookie
//       res.redirect('/login'); // redirect to the homepage or login page
//     }
//   });
// };

exports.logout = (req, res) => {
  //sending empty jwt token --> cant delete this because of httpOnly attribute only emptying it
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 1 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

//only for rendered pages
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //Validate token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //3)Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return res.status(401).send('The user to the token does not exist!');
      }
      //4) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return res
          .status(401)
          .send('Recently changed password, please login again!');
      }
      //User is Logged in
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.protect = async (req, res, next) => {
  //1) Getting token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // console.log(token);
  if (!token) {
    return res
      .status(401)
      .send('You are not logged in please login to get access');
  }
  //2) Validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);
  //3)Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res.status(401).send('The user to the token does not exist!');
  }
  //4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return res
      .status(401)
      .send('Recently changed password, please login again!');
  }
  //megadja az engedélyt a route eléréshez a felhasználónak
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array ['admin','user']
    if (!roles.includes(req.user.role)) {
      return res.status(403).send('You do not have permission.');
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  //1) Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).send('There is no user with that email address');
  }
  console.log(user._id);
  //2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  console.log(resetToken);
  await user.save({ validateBeforeSave: false });
  //3) Send it to users email
  const resetURL = `${req.protocol}:${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}}`;
  const message = `Forgot your password? Submit a patch request with your new password, and passconfirm url: ${resetURL}`;
  try {
    await new Email2(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.jelszoVisszaallitasToken = undefined;
    user.jelszoVisszaallitasLejar = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err);

    res.status(500).send('There was an error sending the email');
  }
};
exports.resetPassword = async (req, res, next) => {
  //1) get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    jelszoVisszaallitasToken: hashedToken,
    jelszoVisszaallitasLejar: { $gt: Date.now() },
  });
  //2) If token is not expired and there is a user
  if (!user) {
    return res.status(400).send('Token is invalid or has expired');
  }
  user.jelszo = req.body.jelszo;
  user.jelszoMegerosites = req.body.jelszoMegerosites;
  user.jelszoVisszaallitasToken = undefined;
  user.jelszoVisszaallitasLejar = undefined;
  await user.save();
  //3) Update changedPasswordAt property for the user

  //4) Log the user in};
  createSendToken(user, 200, res);
};

exports.updatePassword = async (req, res, next) => {
  //Logged in users but password needs to be added again
  //1) get user from the collection
  const user = await User.findById(req.user.id).select('+jelszo'); //comes from protect middleware
  //2)Posted password is correct?
  // console.log(user);
  if (!(await user.correctPassword(req.body.jelszoJelenlegi, user.jelszo))) {
    return res.status(401).send('Your current password is wrong!');
  }
  //3) If yes, update password
  user.jelszo = req.body.jelszo;
  user.jelszoMegerosites = req.body.jelszoMegerosites;
  await user.save();
  //4) log user in , send JWT
  createSendToken(user, 200, res);
};
