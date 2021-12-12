require("dotenv").config();
const nodeMailer = require("nodemailer");
const smtpUri = `smtps://${process.env.MJAPIKEY}:${process.env.MJSECRETKEY}@${process.env.MJSMTPSERVER}`;
const transporter = nodeMailer.createTransport(smtpUri);

function sendMail(options) {
  return new Promise(async (resolve, reject) => {
    const sender = "reptilimt@gmail.com";
    console.log(smtpUri);
    try {
      console.log(options);
      await transporter.sendMail({
        from: sender,
        to: options.email,
        subject: "Inscription", // Subject line
        text: options.message, // plain text body
        html: "<p>" + options.message + "</p>",
      });
      resolve();
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
module.exports = sendMail;
