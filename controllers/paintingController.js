const express = require('express');
const multer = require('multer');
const Painting = require('../models/paintingModel');
const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const app = require('../app');
const catchAsync = require('../utils/catchAsync');
const hpp = require('hpp');
const factory = require('./handlerFactory');
const fs = require('fs');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/upload');
//   },
//   filename: (req, file, cb) => {
//     //timestamp.jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `${Date.now()}.${ext}`);
//   },
// });

// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb('Error');
//   }
// };

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, //30mb kicsit sok
});

exports.uploadPhoto = upload.array('file', 3);

//GET
exports.getAllPaintings = async (req, res, next) => {
  //EXECUTE query
  const features = new APIFeatures(Painting.find(), req.query)
    .filter()
    .sort()
    .limit()
    .pagination();

  const paintings = await features.query; //.explain(); -->indexes

  //const paintings = await Painting.find();

  res.status(200).json({
    status: 'success',
    results: paintings.length,
    data: {
      paintings,
    },
  });
};

exports.modifyPaintingPhoto = async (req, res, next) => {
  if (!req.files) {
    return next();
  }
  const photos = req.files.length;
  try {
    for (let i = 0; i < photos; i++) {
      const buffer = await sharp(req.files[i].buffer, {
        failOnError: false,
      })
        .toFormat('jpeg')
        .resize(1000, 1000)
        .jpeg({ quality: 50 })
        .toBuffer();
      req.files[i].buffer = buffer;
    }
    next();
  } catch (err) {
    return next(err);
  }
};

//POST
exports.createPainting = async (req, res) => {
  try {
    const photos = req.files;
    console.log('PHOTOS');
    console.log(photos);
    console.log('BUFFER');

    console.log(photos[0].buffer);
    //processing images
    const processedBuffers = [];

    const bucket = admin.storage().bucket();
    let filenames = [];
    const uploadFilesToFirebase = async (photos) => {
      try {
        //tömb a filenevekből
        for (let i = 0; i < photos.length; i++) {
          const filename = `${Date.now()}-${i + 1}.jpg`;
          filenames.push(filename);
        }
        //kép mentése db-be
        const id = req.user.id;
        const newPainting = await new Painting({
          felhasznaloId: new mongoose.Types.ObjectId(id),
          cim: req.body.cim,
          festo: req.body.festo,
          tipus: req.body.tipus,
          meret: req.body.meret,
          ar: req.body.ar,
          kepek: filenames,
          feltoltesDatum: req.body.feltoltesDatum,
          jovahagyott: req.body.jovahagyott,
        });
        console.log(
          '--------------------------ÚJ FESTMÉNY--------------------------'
        );
        console.log(newPainting);
        try {
          await newPainting.save();
        } catch (err) {
          console.log(err);
        }
        res.status(201).json({
          status: 'success',
          newPainting,
        });
        //fájlnevek módosítása
        const timestamp = filenames[0].split('-')[0];
        const query = {
          kepek: {
            $regex: new RegExp(`^.*-${timestamp}-.*\\.jpg$`),
          },
        };
        let picNames = [];
        Painting.find(query)
          .then(async (results) => {
            picNames = results.map(({ kepek }) => kepek).flat();
            console.log('picNames KEPEK');
            console.log(picNames);
            //fájlnevek feltöltése firebase-re
            for (let i = 0; i < photos.length; i++) {
              const filePath = `images/${picNames[i]}`;
              const fileRef = bucket.file(filePath);
              await fileRef.save(photos[i].buffer, {
                contentType: 'image/jpeg',
              });
            }
            console.log('All files uploaded successfully.');
          })
          .catch((err) => {
            console.error(err);
          });
      } catch (error) {
        console.error(error);
      }
    };
    uploadFilesToFirebase(photos);
    const firebaseConfig = require('../firebaseConfig');
    // Get the public URL of the file
    // const publicUrl = `https://storage.googleapis.com/${firebaseConfig.storageBucket}/${filePath}`;
  } catch (err) {
    console.log(err);
    res.status(500).send('Nem sikerült létrehozni a festményt!');
  }
};
//GET by ID
exports.getPainting = async (req, res) => {
  const painting = await Painting.findById(req.params.id).populate(
    'felhasznaloId'
  );
  res.status(200).json({
    status: 'success',
    data: {
      painting,
    },
  });
};

//PATCH
exports.updatePainting = catchAsync(async (req, res, next) => {
  const painting = await Painting.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'succes',
    painting,
  });
});

//DELETE
exports.deletePainting = catchAsync(async (req, res, next) => {
  await Painting.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
