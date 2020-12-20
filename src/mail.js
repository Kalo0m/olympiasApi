require("dotenv").config();
const nodeMailer = require("nodemailer");
const smtpUri = `smtps://${process.env.MJAPIKEY}:${process.env.MJSECRETKEY}@${process.env.MJSMTPSERVER}`;
const transporter = nodeMailer.createTransport(smtpUri);

function sendMail(options) {
  return new Promise(async (resolve, reject) => {
    const sender = "olympiasImt@gmail.com";
    console.log(smtpUri);
    try {
      console.log(options);
      await transporter.sendMail({
        from: sender,
        to: options.email,
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>",
      });
      resolve();
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
module.exports = sendMail;
