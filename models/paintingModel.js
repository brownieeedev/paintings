const mongoose = require('mongoose');
const validator = require('validator');
const User = require('./userModel');
const slugify = require('slugify');
const multer = require('multer');

const paintingSchema = new mongoose.Schema({
  felhasznaloId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cim: { type: String, required: true, unique: true },
  festo: { type: String, required: true },
  tipus: {
    type: String,
    enum: [
      'Olaj',
      'Akvarell',
      'Freskó',
      'Monotípia',
      'Pasztell',
      'Gouche',
      'Tempera',
      'Enkausztika',
    ],
    required: true,
    default: 'Olaj',
  },
  slug: String,
  leiras: String,
  kepek: [{ type: String }],
  meret: { type: String, required: true },
  ar: { type: Number, required: true },
  feltoltesDatum: { type: Date, required: true, default: Date.now() },
  jovahagyott: { type: Boolean, required: true, default: false },
});

paintingSchema.post('save', async function () {
  const pipeline = [
    {
      $match: { felhasznaloId: this.felhasznaloId },
    },
    {
      $group: {
        _id: '$felhasznaloId',
        count: { $sum: 1 },
      },
    },
  ];

  const result = await Painting.aggregate(pipeline);

  const userId = result[0]._id;
  const count = result[0].count;

  await User.updateOne({ _id: userId }, { $set: { festmenyekSzama: count } });
});

paintingSchema.post('save', async function (doc) {
  let filenames = [];
  for (let i = 0; i < doc.kepek.length; i++) {
    //új név mentése
    const ext = '.' + doc.kepek[i].split('.')[1];
    const filename = doc._id + '-' + doc.kepek[i].split('.')[0] + ext;
    filenames.push(filename);
  }
  await Painting.findOneAndUpdate({ _id: doc._id }, { kepek: filenames });
});

paintingSchema.index({
  ar: 1, //-1 desc 1 ascending
});

paintingSchema.pre('save', function (next) {
  this.slug = slugify(this.cim, { lower: true });
  next();
});

paintingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'felhasznaloId',
    select: '-__v -jelszoMegvaltoztatva',
  });
  next();
});

paintingSchema.index({ '$**': 'text' });

const Painting = mongoose.model('Painting', paintingSchema, 'FestmenyekTeszt');
module.exports = Painting;
