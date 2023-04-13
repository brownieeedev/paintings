const mongoose = require('mongoose');
const validator = require('validator');
const Painting = require('../models/paintingModel');
const User = require('../models/userModel');

const rendelesSchema = new mongoose.Schema({
  felhasznaloId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  festmenyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Painting',
    required: true,
  },
  osszeg: {
    type: Number,
    require: true,
  },
  datum: {
    type: Date,
    default: Date.now,
  },
  fizetesMod: {
    type: String,
    enum: ['Készpénz', 'Bankkártya', 'Utalás'],
    default: 'Bankkártya',
  },
  fizetve: {
    type: Boolean,
    default: true,
  },
});

rendelesSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'festmenyId',
    select: '-__v',
  }).populate({
    path: 'felhasznaloId',
    select: '-__v -jelszoMegvaltoztatva',
  });
  next();
});

const Rendeles = mongoose.model('Rendeles', rendelesSchema, 'Rendelesek');

module.exports = Rendeles;
