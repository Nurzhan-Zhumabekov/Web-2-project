const nodemailer = require('nodemailer');

const SMTP_PORT = Number(process.env.SMTP_PORT || 587);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async (options) => {
    if (!options?.email) {
        throw new Error('Recipient email is required');
    }

    const mailOptions = {
        from: `Restaurant App <${process.env.FROM_EMAIL || 'no-reply@restaurant.com'}>`,
        to: options.email,
        subject: options.subject || 'Restaurant App Notification',
        text: options.message || '',
        html: options.html || ''
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
