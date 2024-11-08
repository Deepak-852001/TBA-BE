const express = require('express');
const router = express.Router();
const addQuestion = require('../components/addQuestion')
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/addDictation', addQuestion.addDictationQuestion);
router.get('/getDictation/:level', addQuestion.getDicationQuestion)
router.post('/flashCards', upload.single('image'), addQuestion.uploadImage)
router.get('/getFlashCard/:level', addQuestion.getFlashcard)

module.exports = router;