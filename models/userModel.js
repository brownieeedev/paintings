const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const Painting = require('./paintingModel');

const userSchema = new mongoose.Schema({
  nev: { type: String },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Adjon meg egy helyes formátú emailt!'],
    required: true,
  },
  lakcim: { type: String },
  telszam: { type: String },
  festmenyekSzama: { type: Number, default: 0 },
  regisztracioDatuma: { type: Date, required: true, default: Date.now() },
  jelszo: {
    type: String,
    minlength: [8, 'Jelszó legalább 8 karaktert kell tartalmazzon!'],
    required: true,
    select: false,
  },
  jelszoMegerosites: {
    type: String,
    required: true,
    validate: {
      validator: function (el) {
        return el === this.jelszo;
      },
      message: 'A jelszavak nem egyeznek',
    },
  },
  jelszoMegvaltoztatva: { type: Date },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  jelszoVisszaallitasToken: { type: String },
  jelszoVisszaallitasLejar: { type: Date },
});

//adatlekérés és az adatlementése között fut le, ilyenkor enkriptáljuk
userSchema.pre('save', async function (next) {
  //csak akkor fusson a method ha a jelszo tényleg meg lett változtatva
  if (!this.isModified('jelszo')) return next();

  this.jelszo = await bcrypt.hash(this.jelszo, 12);
  //jelszó megersítés field törlése
  this.jelszoMegerosites = undefined;
  next();
});

userSchema.statics.updatePaintingCount = async function () {
  const pipeline = [
    {
      $group: {
        _id: '$felhasznaloId',
        count: { $sum: 1 },
      },
    },
  ];
  const results = await Painting.aggregate(pipeline);

  for (const result of results) {
    const userId = result._id;
    const count = result.count;

    await this.updateOne({ _id: userId }, { $set: { festmenyekSzama: count } });
  }
  await User.updatePaintingCount();
};

userSchema.pre('save', function (next) {
  if (!this.isModified('jelszo') || this.isNew) return next();
  this.jelszoMegvaltoztatva = Date.now() - 3000;
  next();
});

userSchema.pre(/^find/, function (next) {
  //this points to current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (Password, userPassword) {
  return await bcrypt.compare(Password, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.jelszoMegvaltoztatva) {
    const jelszoMegvaltoztatva = parseInt(
      this.jelszoMegvaltoztatva.getTime() / 1000,
      10
    );
    //console.log(jelszoMegvaltoztatva, JWTTimeStamp);
    return JWTTimeStamp < jelszoMegvaltoztatva;
  }
  //False == nem lett megváltoztatva még a jelszó soha
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.jelszoVisszaallitasToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.jelszoVisszaallitasLejar = Date.now() + 10 * 60 * 1000; //10perc

  return resetToken;
};

const User = mongoose.model('User', userSchema, 'FelhasznalokTeszt');

module.exports = User;
