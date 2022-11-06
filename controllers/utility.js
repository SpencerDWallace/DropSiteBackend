const nodemailer = require('nodemailer')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')


const passwordResetSchema = new mongoose.Schema({
    email:{type:String,
    required:[true, 'Please provide an email.'],
    match:[
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please provide a valid email.'
    ],
    unique:true,
},
})

const passwordReset = function(recipient, resetID, url){
    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.E,
        pass: process.env.EPW
    }
    });
    
    let resetURL = new URL(`${url}?id=${resetID}`);
    
    var mailOptions = {
    from: process.env.E,
    to: recipient,
    subject: 'Your Password Reset',
    text: `Here is your link to reset your password: ${resetURL}`
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
}

const adminCreate = function(recipient, password, adminID, url){
    var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.E,
        pass: process.env.EPW
    }
    });
    
    let registerURL = new URL(`${url}?id=${adminID}`);
    
    var mailOptions = {
    from: process.env.E,
    to: recipient,
    subject: 'Your Employee Registration',
    text: 
    `Hello,\n
You have been asked to register your employee account. Your temporary password is: ${password}\n
Please use this link to finish your registration: ${registerURL}\n
    Thank you,
    Droppers Team.`
    };

    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
}

const saltPW = async function(password){
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    return password
}
const ResetPassword = mongoose.model('ResetPassword', passwordResetSchema)
module.exports = {passwordReset, ResetPassword, saltPW, adminCreate}