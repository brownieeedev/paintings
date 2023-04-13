const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Painting = require('./models/paintingModel');

//connecting to db
dotenv.config({ path: './config.env' });
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

Painting.aggregate([
  {
    $group: {
      _id: { field: '$fieldName', value: '$fieldValue' },
      count: { $sum: 1 },
      docs: { $push: '$_id' },
    },
  },
  { $match: { count: { $gt: 1 } } },
  {
    $lookup: {
      from: 'mycollection',
      localField: 'docs',
      foreignField: '_id',
      as: 'docsToRemove',
    },
  },
]).exec(function (err, result) {
  if (err) throw err;

  const idsToRemove = result.flatMap((group) =>
    group.docsToRemove.map((doc) => doc._id)
  );

  Painting.deleteMany(
    { _id: { $in: idsToRemove } },
    function (err, deleteResult) {
      if (err) throw err;

      console.log(`Removed ${deleteResult.deletedCount} documents.`);
      mongoose.connection.close();
    }
  );
});

// if (process.argv[2] === '--removeDuplicateCim') {
//   method();
// }
