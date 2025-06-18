import { transporter } from "./email-config.js";
import * as fs from 'fs'; // Import the file system module
import * as path from 'path'; // Import the path module
// --- Bắt đầu thay đổi ở đây để định nghĩa __dirname tương đương trong ES Modules ---
import { fileURLToPath } from 'url';

// Lấy đường dẫn thư mục hiện tại cho ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- Kết thúc thay đổi ---

function getVNDate(timestamp) {
      const date = new Date(timestamp);
      date.setHours(date.getHours() + 7); // ✅ Cộng trực tiếp 7 giờ

      return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
      });
}

/**
 * Function to send a success registration email after player registration & payment info
 */
async function sendSuccessRegister(playerInfo) {
      const { email, name, phoneNumber, age, gender, rank, college, registerTime } = playerInfo;
      console.log(playerInfo);
      const templatePath = path.join(__dirname, './templates/successRegisterMail.html');
      const registerAt = getVNDate(registerTime);

      let emailHtmlContent;
      try {
            emailHtmlContent = fs.readFileSync(templatePath, 'utf8');
      } catch (readError) {
            console.error('Error reading email template file: ', readError);
            throw new functions.https.HttpsError('internal', 'Failed to read email template.', readError.message);
      }

      emailHtmlContent = emailHtmlContent
            .replaceAll('{{name}}', name)
            .replaceAll('{{phoneNumber}}', phoneNumber)
            .replaceAll('{{registerAt}}', registerAt)
            .replaceAll('{{email}}', email)
            .replaceAll('{{age}}', age)
            .replaceAll('{{gender}}', gender)
            .replaceAll('{{rank}}', rank)
            .replaceAll('{{college}}', college);


      // Configure the email options
      const mailOptions = {
            from: 'coccamco.fpthcm@gmail.com',
            to: email,
            subject: '[CÓC CẦM CƠ] - THÔNG BÁO ĐĂNG KÝ THÀNH CÔNG & THANH TOÁN LỆ PHÍ THAM GIA',
            html: emailHtmlContent
      };

      try {
            // Send the email
            await transporter.sendMail(mailOptions);
            console.log(`Registration success email sent to: ${email}`);

            return true;
      } catch (error) {
            console.error(`Failed to send email to ${email}:`, error);
            return false;
      }
}

export { sendSuccessRegister };