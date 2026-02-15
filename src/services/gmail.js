const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});
// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Bankend-bank" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const sendRegistrationEmail = async (userEmail, name) => {
    const subject = "Welcome to Bankend-bank";
    const text = `Hello ${name}, Welcome to Bankend-bank`;
    const html = `<h1>Hello ${name}, Welcome to Bankend-bank</h1>`;
    try {
        await sendEmail(userEmail, subject, text, html);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


const sendTransactionEmail = async (userEmail, name, amount, toAccount) => {
    const subject = "Transaction Notification";
    const text = `Hello ${name}, Transaction of ${amount} to ${toAccount} has been completed`;
    const html = `<h1>Hello ${name}, Transaction of ${amount} to ${toAccount} has been completed</h1>`;
    try {
        await sendEmail(userEmail, subject, text, html);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const sendFailedTransactionEmail = async (userEmail, name, amount, toAccount) => {
    const subject = "Transaction Failed";
    const text = `Hello ${name}, Transaction of ${amount} to ${toAccount} has been failed`;
    const html = `<h1>Hello ${name}, Transaction of ${amount} to ${toAccount} has been failed</h1>`;
    try {
        await sendEmail(userEmail, subject, text, html);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendRegistrationEmail, sendTransactionEmail, sendFailedTransactionEmail };