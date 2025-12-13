// test-send.js
const nodemailer = require("nodemailer");
(async () => {
  const transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: { user: "apikey", pass: process.env.SENDGRID_API_KEY || "SG.YOURKEY" }
  });
  try {
    console.log("verifying...");
    await transporter.verify();
    console.log("verified");
    const res = await transporter.sendMail({
      from: 'WanderSwipe <wanderswipeofficial@gmail.com>',
      to: "yourrecipient@gmail.com",
      subject: "SMTP test",
      text: "Test from SendGrid SMTP"
    });
    console.log("send result:", res);
  } catch (e) {
    console.error(e);
  }
})();
