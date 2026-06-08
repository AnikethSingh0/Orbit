const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const express = require('express');
const multer = require('multer');
const {cloud_api_key,cloud_name,cloud_api_secret} = require('./config.js');
 
cloudinary.config({
    cloud_name: cloud_name,
    api_key: cloud_api_key,
    api_secret: cloud_api_secret
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'media',
    allowedFormats: ['jpg', 'png', 'jpeg', 'gif', 'mp4', 'webp'], 
    resource_type: 'auto'
  },
});

const parser = multer({ storage: storage });

module.exports = parser;