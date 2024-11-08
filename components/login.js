const User = require('../models/user');
const bcryptjs = require('bcryptjs');  // Use bcryptjs instead of bcrypt
const nodemailer = require('nodemailer');
const { ObjectId } = require('mongoose').Types; // Import ObjectId for Mongoose queries

let transporter = nodemailer.createTransport({
    host: process.env.MAILER_HOST,
    port: process.env.PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAILER_USERNAME, // generated ethereal user
      pass: process.env.MAILER_PASSWORD
    },
});

async function getStudentById(req, res) {
    try {
        const {id} = req.params;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid student ID format' });
        }
        const result = await User.findById(id).select('-password');
        if (!result) return res.status(401).json({ message: 'Student Data not found for the given Id' });

        res.status(200).json({ message: 'Student data fetched successfully', data: result });

    } catch (error) {
        res.status(500).json({ message: 'Failed to get the student data', error: error.message });
    }
}

async function getStudent(req, res) {
    try {
        const studentData = req.query;
        const result = await User.find(studentData).select('-password');
        if (!result.length) return res.status(401).json({ message: 'Student not found for the given data' });

        res.status(200).json({ message: "Student Data fetched Successfully", data: result });

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch the student data', error: error.message });
    }
}

async function studentRegister(req, res) {
    try {
        const { password, ...otherData } = req.body;

        // Generate a salt and hash the password using bcryptjs
        const saltRounds = 10;
        const hashedPassword = await bcryptjs.hash(password, saltRounds);

        // Create a new user instance with the hashed password
        const userData = new User({
            ...otherData,
            password: hashedPassword
        });

        await userData.save();

        res.status(201).json({ message: "Student data stored successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to store student data", error: error.message });
    }
}

async function studentLogin(req, res) {
    try {
        const { studentName, password } = req.body;

        const studentData = await User.findOne({ studentName });
        if (!studentData) {
            return res.status(401).json({ message: `No records found for student name ${studentName}` });
        }

        // Compare the provided password with the hashed password using bcryptjs
        const isMatch = await bcryptjs.compare(password, studentData.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        res.status(200).json({ message: "Login successful" });
    } catch (err) {
        res.status(500).json({ message: "Failed to Login", error: err.message });
    }
}

async function updateStudentById(req, res) {
    try {
        const studentData = req.body;
        const { _id } = studentData;

        if (!_id || !ObjectId.isValid(_id)) {
            return res.status(400).json({ message: 'Invalid student ID' });
        }

        const result = await User.findByIdAndUpdate(
            _id,
            { $set: studentData },
            { new: true, runValidators: true }
        );
        if (result) {
            return res.status(200).json({ message: "Student Data updated successfully" });
        }

        res.status(401).json({ message: "Student Data not found for the given Id" });
    } catch (error) {
        res.status(500).json({ message: "Failed to Update", error: error.message });
    }
}

async function deleteStudentById(req, res) {
    try {
        const { id } = req.params;
        if (!id || !ObjectId.isValid(id)) return res.status(401).json({ message: "Student Id not provided or invalid" });

        const result = await User.findByIdAndDelete(id);
        if (result) {
            return res.status(200).json({ message: "Student Data deleted successfully" });
        }

        res.status(401).json({ message: "Student Data not found for the given Id" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete the Student Data", error: err.message });
    }
}

async function getOTP(req, res) {
    try {
        const { email, id } = req.body;
        if (!email || !id) return res.status(401).json({ message: 'Please provide email and student Id' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const mailOptions = {
            from: 'NoReply@sipabacus.com',
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It is valid for 5 minutes.`
        };

        await transporter.sendMail(mailOptions);

        // Update OTP in the database
        await User.findByIdAndUpdate(
            id,
            { $set: { OTP: otp } },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP', error: error.message });
    }
}

async function validateOTP(req, res) {
    try {
        const { otp, id } = req.body;
        if (!otp || !id || !ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid OTP or student Id' });
        }

        const user = await User.findById(id);
        if (!user || otp !== user.OTP) {
            return res.status(401).json({ message: 'Invalid OTP, please enter the correct OTP' });
        }

        // Mark user as verified
        await User.findByIdAndUpdate(
            id,
            { $set: { isVerified: true } },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ message: "Failed to validate the OTP", error: error.message });
    }
}

module.exports = { studentRegister, studentLogin, updateStudentById, deleteStudentById, getStudentById, getStudent, getOTP, validateOTP };
