const express = require('express');
const router = express.Router();
const user = require('../components/login')


router.get('/student/:id', user.getStudentById)
router.post('/register', user.studentRegister)
router.post('/login', user.studentLogin)
router.patch('/student', user.updateStudentById)
router.delete('/student/:id', user.deleteStudentById)
router.post('/checkOTP', user.validateOTP)
router.get('/getOTP', user.getOTP)
router.get('/student', user.getStudent)

module.exports = router;