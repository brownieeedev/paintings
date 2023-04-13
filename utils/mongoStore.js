const session = require('express-session');
const process = require('process');
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
  uri: process.env.DATABASE_LOCAL,
  collection: 'Kosar',
});

module.exports = { store };
