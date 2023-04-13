const mongoose = require('mongoose');
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/database');
const admin = require('firebase-admin');
require('dotenv').config();
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

//Connect database
const DB = process.env.DATABASE_LOCAL;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    //console.log(con.connections);
    console.log('DB connection successfull');
  });

//kapcsolódás a firebase-hez
const firebaseConfig = require('./firebaseConfig');
firebase.initializeApp(firebaseConfig);
admin.initializeApp({
  credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  storageBucket: firebaseConfig.storageBucket,
});

const storage = admin.storage();
const bucket = storage.bucket();

//SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
