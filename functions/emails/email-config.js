import nodemailer from "nodemailer";

//config to send email
const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
            user: 'coccamco.fpthcm@gmail.com',
            pass: 'qpbz cdts cnim ohok'
      }
});

function sendEmailWithText(to, subject, text) {
      if (!(to && subject && text)) {
            console.log("invalid-argument");
            return;
      }
      const mailOptions = {
            from: "coccamco.fpthcm@gmail.com",
            to: to,
            subject: subject,
            text: text
      }
      transporter.sendMail(mailOptions);
}

function sendEmailWithHTML(to, subject, html) {
      if (!(to && subject && html)) {
            console.log("invalid-argument");
            return;
      }
      const mailOptions = {
            from: "coccamco.fpthcm@gmail.com",
            to: to,
            subject: subject,
            html: html
      }
      transporter.sendMail(mailOptions);
}

export { transporter, sendEmailWithText, sendEmailWithHTML };