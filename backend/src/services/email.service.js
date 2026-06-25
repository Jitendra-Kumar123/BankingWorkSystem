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

module.exports = transporter;

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

async function sendUserRegistrationEmail(userEmail, name){
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

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Successful - BankingWorkSystem";

  const text = `
Dear ${name},

Your transaction has been processed successfully.

Transaction Details:
Amount: ₹${amount}
Recipient Account: ${toAccount}
Status: Successful

Thank you for using BankingWorkSystem.

Regards,
BankingWorkSystem Team
`;

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
  <div style="background:#16a34a; padding:15px; text-align:center; color:white;">
    <h2>Transaction Successful</h2>
  </div>

  <p>Dear <strong>${name}</strong>,</p>

  <p>Your transaction has been completed successfully.</p>

  <table style="width:100%; border-collapse: collapse; margin-top:20px;">
    <tr>
      <td style="padding:10px; border:1px solid #ddd;"><strong>Amount</strong></td>
      <td style="padding:10px; border:1px solid #ddd;">₹${amount}</td>
    </tr>
    <tr>
      <td style="padding:10px; border:1px solid #ddd;"><strong>Recipient Account</strong></td>
      <td style="padding:10px; border:1px solid #ddd;">${toAccount}</td>
    </tr>
    <tr>
      <td style="padding:10px; border:1px solid #ddd;"><strong>Status</strong></td>
      <td style="padding:10px; border:1px solid #ddd; color:green;"><strong>SUCCESSFUL</strong></td>
    </tr>
  </table>

  <p style="margin-top:20px;">
    Thank you for using BankingWorkSystem.
  </p>

  <hr />

  <p style="font-size:14px; color:#666;">
    Regards,<br />
    <strong>BankingWorkSystem Team</strong>
  </p>
</div>
`;

  return sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Failed - BankingWorkSystem";

  const text = `
Dear ${name},

We were unable to process your transaction.

Transaction Details:
Amount: ₹${amount}
Recipient Account: ${toAccount}
Status: Failed

Possible reasons:
- Insufficient balance
- Invalid recipient account
- Temporary server issue

Please try again later.

Regards,
BankingWorkSystem Team
`;

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
  <div style="background:#dc2626; padding:15px; text-align:center; color:white;">
    <h2>Transaction Failed</h2>
  </div>

  <p>Dear <strong>${name}</strong>,</p>

  <p>Unfortunately, we could not complete your transaction.</p>

  <table style="width:100%; border-collapse: collapse; margin-top:20px;">
    <tr>
      <td style="padding:10px; border:1px solid #ddd;"><strong>Amount</strong></td>
      <td style="padding:10px; border:1px solid #ddd;">₹${amount}</td>
    </tr>
    <tr>
      <td style="padding:10px; border:1px solid #ddd;"><strong>Recipient Account</strong></td>
      <td style="padding:10px; border:1px solid #ddd;">${toAccount}</td>
    </tr>
    <tr>
      <td style="padding:10px; border:1px solid #ddd;"><strong>Status</strong></td>
      <td style="padding:10px; border:1px solid #ddd; color:red;"><strong>FAILED</strong></td>
    </tr>
  </table>

  <div style="background:#fef2f2; border-left:4px solid #dc2626; padding:12px; margin-top:20px;">
    <strong>Possible Reasons:</strong>
    <ul>
      <li>Insufficient account balance</li>
      <li>Invalid recipient account</li>
      <li>Temporary system issue</li>
    </ul>
  </div>

  <p>Please verify the details and try again.</p>

  <hr />

  <p style="font-size:14px; color:#666;">
    Regards,<br />
    <strong>BankingWorkSystem Team</strong>
  </p>
</div>
`;

  return sendEmail(userEmail, subject, text, html);
}

module.exports ={ 
  sendUserRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};
