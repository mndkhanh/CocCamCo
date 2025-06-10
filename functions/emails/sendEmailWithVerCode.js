import { transporter } from "./email-config.js";
import { generateCode } from "../verification-code/generateCode.js";
import { getCodeStatus } from "../verification-code/getCodeStatus.js";
import functions from "firebase-functions"
import * as fs from 'fs'; // Import the file system module
import * as path from 'path'; // Import the path module

// --- Bắt đầu thay đổi ở đây để định nghĩa __dirname tương đương trong ES Modules ---
import { fileURLToPath } from 'url';

// Lấy đường dẫn thư mục hiện tại cho ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- Kết thúc thay đổi ---

const sendEmailWithVerCode = functions.https.onCall(async (request) => {
      const email = request.data.email;
      console.log("Trying to send email to:", email);

      if (!email) {
            throw new functions.https.HttpsError('invalid-argument', 'Email address is required.');
      }

      try {
            let codeStatus = await getCodeStatus(email);

            // Check if the code status is active
            // If then stopping exec next
            if (codeStatus && codeStatus.status === "ACTIVE") {
                  console.log(`Verification code is already active for ${email}`);
                  return codeStatus;
            }

            // Generate a new code
            const code = await generateCode(email);
            if (!code) {
                  console.log(`Failed to generate code for ${email}`);
                  throw new functions.https.HttpsError('internal', `Failed to generate code for ${email}`);
            }

            const templatePath = path.join(__dirname, './templates/sendOTPregisterMail.html');
            console.log(templatePath);

            let emailHtmlContent;
            try {
                  emailHtmlContent = fs.readFileSync(templatePath, 'utf8');
            } catch (readError) {
                  console.error('Error reading email template file: ', readError);
                  throw new functions.https.HttpsError('internal', 'Failed to read email template.', readError.message);
            }

            emailHtmlContent = emailHtmlContent.replace('{{otp}}', code);

            // Setup mail options
            const mailOptions = {
                  from: 'coccamco.fpthcm@gmail.com',
                  to: email,
                  subject: `[CÓC CẦM CƠ] - MÃ XÁC MINH ĐĂNG KÝ THAM GIA`,
                  html: emailHtmlContent,
            };

            // Send the email
            await transporter.sendMail(mailOptions);
            codeStatus = await getCodeStatus(email);
            // Return a success message
            console.log(`Verification code sent to ${email}`);
            return codeStatus;
      } catch (error) {
            console.error('Error sending email: ', error);
            throw new functions.https.HttpsError('internal', 'Failed to send email', error.message);
      }
});

export { sendEmailWithVerCode };
