const User = require('../models/user');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');


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
        console.log(id)
        const result = await User.findById({_id: new Object(id)}).select('-password');
        console.log(result)
        if(!result) return res.status(401).json({message: 'Student Data not found for the given Id'});

        res.status(200).json({message: 'student data fetched successfully', data: result});

    } catch(error) {
        res.status(500).json({message: 'Failed to get the student data', error: error.message})
    }
}

async function getStudent(req, res) {
    try {
        const studentData = req.query;
        const result = await User.find(studentData).select('-password');
        console.log(result)
        if(!result.length) return res.status(401).json({message: 'Student not found for the given data'});
        
        res.status(200).json({message: "Student Data fetched Successfully", data: result})

    } catch(error) {
        res.status(500).json({message: 'Failed to fetch the student data', error: error.message})
    }
}

async function studentRegister(req, res) {
    try {
        // Extract the password from the request body
        const { password, ...otherData } = req.body;

        // Generate a salt and hash the password
        const saltRounds = 10; // You can adjust the number of salt rounds if necessary
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user instance with the hashed password
        const userData = new User({
            ...otherData,
            password: hashedPassword // Store the hashed password
        });

        // Save the user data
        await userData.save();

        // Respond with a success message
        res.status(201).json({ message: "Student data stored successfully" });
    } catch (error) {
        // Handle errors and send a response
        res.status(500).json({ message: "Failed to store student data", error: error.message });
    }
}

async function studentLogin(req, res) {
    try {
        const {studentName, password} = req.body;

        const studentData = await User.findOne({studentName});

        if(!studentData) {
            return res.status(401).json({message: `No records found for student name ${studentName}`})
        }

        const isMatch = await bcrypt.compare(password, studentData.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Password" });
        }

        res.status(200).json({ message: "Login successful" });
    }
    catch(err) {
        res.status(500).json({message: "Failed to Login", error: err.message})
    }
}

async function updateStudentById(req, res) {
    try {
        const studentData = req.body;
        const result = await User.findByIdAndUpdate(
            {_id: new Object(studentData._id)},
            { $set: studentData },         
            { new: true, runValidators: true } 
        );
        if(result) {
           return res.status(200).json({message: "Student Data updated successfully"})
        }
        
        res.status(401).json({message: "Student Data not found for the given Id"})
        
    }
    catch(error) {
        res.status(500).json({message: "Failed to Update", error: error.message})
    }
}

async function deleteStudentById(req, res) {
    try {
        const {id} = req.params;
        if(!id)  return res.status(401).json({message: "student Id not provided"});
        const result = await User.findByIdAndDelete({_id: new Object(id)});
        if(result) {
            return res.status(200).json({message: "Student Data deleted successfully"})
        }
         
        res.status(401).json({message: "Student Data not found for the given Id"})
        
    }
    catch(err) {
        res.status(500).json({message: "Failed to delete the Student Data", error: err.message})
    }
}

// async function getOTP(req, res) {
//     try {
//         // const { phoneNumber } = req.body; 

       
//         const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generates OTP between 100000 and 999999


//         // Send OTP via SMS
//         const message = await client.messages.create({
//             body: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
//             from: '9361149592', // Replace with your Twilio phone number
//             to: "9443273318" // User's phone number
//         });

//         console.log(`Message sent: ${message.sid}`); // Log the message SID

//         res.status(200).json({ message: 'OTP sent successfully' });
//     } catch (error) {
//         console.error('Error sending OTP:', error);
//         res.status(500).json({ message: 'Failed to send OTP', error: error.message });
//     }
// }

// async function sendOTP(req, res) {
    

//     client.verify.v2.services("VA87d9133b1dcf992c99a5f5094d3e9768")
//       .verifications
//       .create({to: '+919361149592', channel: 'sms'})
//       .then(verification => console.log(verification.sid));
// }

// async function checkOTp(req, res) {

//     const {code} = req.body;
// client.verify.v2.services("VA87d9133b1dcf992c99a5f5094d3e9768")
//       .verificationChecks
//       .create({to: '+919361149592', code: code})
//       .then(verification_check => console.log(verification_check.status));
// }

async function getOTP(req, res) {
    try {
        const { email, id } = req.body; 
        console.log('hi')
        if(!email || !id) return res.status(401).json({message: 'please provide email and student Id'})
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
        const mailOptions = {
            from: 'NoReply@sipabacus.com',
            to: email, 
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It is valid for 5 minutes.`
        };
        await transporter.sendMail(mailOptions);
        
        // If using SMS, you would send the OTP like this:
        // const client = twilio('TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN');
        // await client.messages.create({
        //     body: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
        //     from: 'TWILIO_PHONE_NUMBER',
        //     to: phoneNumber
        // });

        await User.findByIdAndUpdate({_id: new Object(id)},
        {$set: {OTP: otp}},
        { new: true, runValidators: true } 
        )

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP', error: error.message });
    }
}

async function validateOTP(req, res) {
    try {
        const {otp, id} = req.body;
        const {OTP} = await User.findOne({_id: new Object(id)})
        if(otp === OTP){
            await User.findByIdAndUpdate({_id: new Object(id)},
                {$set:{isVerified: true}},
                { new: true, runValidators: true } 
            )
            return res.status(200).json({message: 'OTP verified Successfully'})
        }

        res.status(401).json({message:'Invalid OTP, please enter the correct OTP'})
    } catch(error) {
        res.status(500).json({message: "Failed to Validate the OTP", error: error.message})
    }
}



module.exports = { studentRegister, studentLogin, updateStudentById, deleteStudentById, getStudentById, getStudent, getOTP, validateOTP };
