const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Painting = require('./models/paintingModel');
const User = require('./models/userModel');

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

//tipus és méret oszlopok megváltoztatása

const arr = [
  'Olaj',
  'Akvarell',
  'Freskó',
  'Monotípia',
  'Pasztell',
  'Gouche',
  'Tempera',
  'Enkausztika',
];

const updateTipus = async () => {
  try {
    const paintings = await Painting.find(); //minden festmény lekérése

    for (const item of paintings) {
      const randomTipus = arr[Math.floor(Math.random() * arr.length)];
      item.tipus = randomTipus;
      await item.save();
    }
  } catch (err) {
    console.log(err);
  }
};

const arrMeret = [
  '500x500',
  '250x250',
  '1000x1000',
  '1500x1500',
  '1000x1500',
  '500x750',
];
const updateMeret = async () => {
  try {
    const paintings = await Painting.find();

    for (const item in paintings) {
      const randomMeret = arrMeret[Math.floor(Math.random() * arrMeret.length)];
      item.meret = randomMeret;
      await item.save();
    }
  } catch (err) {
    console.log(err);
  }
};

const updateFelhasznaloId = async () => {
  try {
    const ids = await User.find({}, '_id', (err, felhasznalok) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    const felhasznaloIds = felhasznalok.map((felhasznalo) => felhasznalo._id);
    Painting.updateMany(
      {},
      {
        $set: {
          felhasznaloId:
            felhasznaloIds[Math.floor(Math.random() * felhasznaloIds.length)],
        },
      },
      (err, result) => {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

const updateFestmenyekSzama = async () => {
  const pipeline = [
    {
      $group: {
        _id: '$felhasznaloId',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        felhasznaloId: '$_id',
        count: 1,
      },
    },
  ];
  try {
    const results = await Painting.aggregate(pipeline).exec();

    for (const result of results) {
      const { felhasznaloId, count } = result;

      await User.updateOne({ _id: felhasznaloId }, { festmenyekSzama: count });

      console.log(`Updated User ${felhasznaloId} with count ${count}`);
    }
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '--updateTipus') {
  updateTipus();
} else if (process.argv[2] === '--updateMeret') {
  updateMeret();
} else if (process.argv[2] === '--changeIds') {
  updateFelhasznaloId();
} else if (process.argv[2] === '--updateFestmenyekSzama') {
  updateFestmenyekSzama();
}
