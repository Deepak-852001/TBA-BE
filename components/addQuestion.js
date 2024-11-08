const Dictation = require('../models/dictation');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const FlashCard = require('../models/flashCard');
const path = require('path');

// Change multer destination to a writable directory such as /tmp (for AWS Lambda)
const upload = multer({ dest: '/tmp/' });

cloudinary.config({
  cloud_name: 'duoxhwhd3', 
  api_key: '673299328898483', 
  api_secret: 'SQl6_WS0z3EKe3tmsmlUQ-70Q24'
});

async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if the file was uploaded
    const checkData = await FlashCard.findOne({ level: req.body.level });
    
    if (checkData) {
      // Handle file upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'flash-cards' }, 
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        const filePath = path.join('/tmp', req.file.filename); // Full path to file
        fs.createReadStream(filePath).pipe(stream); // Pipe file to Cloudinary stream
      });

      const newImageUrls = checkData.imageUrl;
      newImageUrls.push(result.secure_url);
      await FlashCard.updateOne({ level: req.body.level }, { $set: { imageUrl: newImageUrls } });

      res.json({
        message: 'Image uploaded successfully',
        url: result.secure_url
      });
    } else {
      // Upload a new record
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'flash-cards' }, 
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        const filePath = path.join('/tmp', req.file.filename); // Full path to file
        fs.createReadStream(filePath).pipe(stream); // Pipe file to Cloudinary stream
      });

      const data = new FlashCard({
        level: req.body.level,
        imageUrl: result.secure_url
      });
      await data.save();

      res.json({
        message: 'Image uploaded successfully',
        url: result.secure_url
      });
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
}

async function getFlashcard(req, res) {
  try {
    const { level } = req.params;
    const data = await FlashCard.findOne({ level: level }).select("-_id");
    res.status(200).json({ message: "Flash card fetched successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Failed to get the flash card", error: error.message });
  }
}

async function addDictationQuestion(req, res) {
  try {
    const { level, questions } = req.body;
    const data = await Dictation.findOne({ level: level });
    
    if (data) {
      let ques = data.questions;
      for (let a of questions) {
        ques.push(a);
      }
      await Dictation.updateOne({ level: level }, { $set: { questions: ques } });
    } else {
      const dictationData = new Dictation(req.body);
      await dictationData.save();
    }
    res.status(200).json({ message: "Questions stored successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error while adding the question", error: err.message });
  }
}

async function getDicationQuestion(req, res) {
  try {
    const { level } = req.params;
    const data = await Dictation.findOne({ level: level });
    res.status(200).json({ message: "Question successfully fetched", Question: data.questions });
  } catch (error) {
    res.status(500).json({ message: "Error during fetch questions", error: error.message });
  }
}

module.exports = { addDictationQuestion, getDicationQuestion, uploadImage, getFlashcard };
