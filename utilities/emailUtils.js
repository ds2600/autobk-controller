// utilities/emailutils.js

const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const db = require('../models');

function generateUniqueToken() {
    return uuidv4();
}

function sendPasswordResetEmail(email, resetToken) {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const resetLink = `${process.env.REACT_APP_FRONTEND_URL}/reset-password/${resetToken}`; 

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        text: `You have requested to reset your password. Click on the following link to reset your password:\n\n${resetLink}\n\nIf you did not request this password reset, please ignore this email.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function validateResetToken(token) {
    return db.User.findOne({ where: { resetToken: token } })
        .then(user => {
            if (user && user.resetTokenExpiration > Date.now()) {
                return true;
            }
            return false;
        })
        .catch(error => {
            console.error(error);
            return false;
        });
}

module.exports = {
    validateResetToken,
    generateUniqueToken,
    sendPasswordResetEmail
};