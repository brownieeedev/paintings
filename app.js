const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { store } = require('./utils/mongoStore');
const dotenv = require('dotenv');
dotenv.config({ path: './env' });

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

//ROUTES meghívása
const paintingsRouter = require('./routes/paintingsRoute');
const userRouter = require('./routes/userRoute');
const rendelesRouter = require('./routes/rendelesRoute');
const viewRouter = require('./routes/viewRoute');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//SERVING STATIC FILES
//console.log(path.join(__dirname + '/public'));
app.use(
  express.static(path.join(__dirname + '/public'), {
    // Disable strict MIME type checking
    //mimeTypes: {},
  })
);

//SESSION COOKIE és store
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);

//képek limit
// app.use(
//   fileUpload({
//     limits: {
//       fileSize: 10000000,
//     },
//     abortOnLimit: true,
//   })
// );

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname + '/dist')));
app.use(express.static(path.join(__dirname + '/src')));

//GLOBAL MIDDLEWARE
// app.use(
//   helmet.contentSecurityPolicy({
//     useDefaults: true,
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "'unsafe-inline'", "'https://fontawesome.com'"],
//       objectSrc: ["'none'"],
//       upgradeInsecureRequests: true,
//       imgSrc: [
//         "'self'",
//         'data:',
//         `https://storage.googleapis.com/${process.env.PROJECT_LINK}/images`,
//       ],
//       fontSrc: [
//         "'self'",
//         'https://fonts.gstatic.com',
//         'https://fonts.googleapis.com',
//       ],
//       upgradeInsecureRequests: [],
//     },
//   })
// );

//app.use(helmet.contentSecurityPolicy());

//   directives: {
//     defaultSrc: ["'self'", 'data:', 'blob:'],

//     fontSrc: ["'self'", 'https:', 'data:'],

//     scriptSrc: ["'self'", 'unsafe-inline'],

//     scriptSrc: [
//       "'self'",
//       'https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.4/axios.js',
//     ],

//     scriptSrcElem: [
//       "'self'",
//       'https:',
//       'https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.4/axios.js',
//     ],

//     styleSrc: ["'self'", 'https:', 'unsafe-inline'],

//     connectSrc: [
//       "'self'",
//       'data',
//       'https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.4/axios.js',
//     ],
//   },
// })
//(); //set security http headers
app.use(morgan('dev'));
app.use(express.json()); //body parser  -- { limit: '10kb' }
app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: ['cim'],
  })
); //prevent parameter pollution

//limit request from same API
const limiter = rateLimit({
  max: 100,
  windowsMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

//COOKIE log
app.use((req, res, next) => {
  //console.log(req.cookies);
  next();
});

//ROUTES
app.use('/', viewRouter);
app.use('/api/v1/paintings', paintingsRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/rendeles', rendelesRouter);

// app.all('*', (req, res, next) => {
//   next(new AppError(`Cant find ${req.originalUrl} on this server`), 404);
// });
// app.use(globalErrorHandler);

module.exports = app;
