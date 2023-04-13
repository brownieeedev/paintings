//const express = require('express');
const app = require('../app');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

//GET
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getMe = async (req, res, next) => {
  //if (!req.params.id) req.params.id = req.user.id;
  //const user = await User.findById(req.user.id);
  //console.log(user);
  // if (!user) res.status(404).send('User not found');
  // res.status(200).json({
  //   status: 'success',
  //   user,
  // });
};

exports.updateMe = async (req, res, next) => {
  //1) error if user post password data
  if (req.body.jelszo || req.body.jelszoMegerosites) {
    res.status(400).send('This route is not for password updates!');
  }
  //2) only fields that needs to be updated
  const filteredBody = filterObj(req.body, 'nev', 'email');
  //3) update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
};

exports.deleteMe = async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

//POST
exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { user: newUser },
  });
});

//GET by ID
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

//PATCH
exports.updateUser = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'succes',
    tour,
  });
});

//DELETE
exports.deleteUser = catchAsync(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
