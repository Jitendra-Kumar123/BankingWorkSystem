const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GOOGLE_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
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
      from: `"BankingWorkSystem" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendUserRegistrationEmail(userName, email){
    const subject = "Welcome to BankingWorkSystem";

    const text = `
                    Dear User,

                    Welcome to BankingWorkSystem.

                    We are pleased to have you onboard. Our platform is designed to help you manage banking operations efficiently, securely, and professionally.

                    If you need any assistance, please feel free to contact our support team.

                    Best Regards,
                    BankingWorkSystem Team
                    `;


    const html =  `
                        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 30px;">
                        <h1 style="color: #1e3a8a;">Welcome to BankingWorkSystem</h1>

                        <p>Dear User,</p>

                        <p>
                            We are delighted to welcome you to BankingWorkSystem.
                        </p>

                        <p>
                            Our platform is built to simplify banking workflow management while maintaining the highest standards of security and reliability.
                        </p>

                        <p>
                            We look forward to helping you achieve greater productivity and efficiency.
                        </p>

                        <hr style="margin: 25px 0;" />

                        <p>
                            Best Regards,<br />
                            <strong>BankingWorkSystem Team</strong>
                        </p>
                        </div>
                        `     ;
                        
    await sendEmail(userEmail, subject, text, html);                  
}

module.exports = sendUserRegistrationEmail;
module.exports = transporter;