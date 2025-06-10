import { sendEmailWithHTML } from "./email-config.js";
import * as fs from 'fs'; // Import the file system module
import * as path from 'path'; // Import the path module
// --- Bắt đầu thay đổi ở đây để định nghĩa __dirname tương đương trong ES Modules ---
import { fileURLToPath } from 'url';

// Lấy đường dẫn thư mục hiện tại cho ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- Kết thúc thay đổi ---

function getFailedContent(playerName, failedComment) {
      const templatePath = path.join(__dirname, './templates/failPaymentMail.html');

      let emailHtmlContent;
      try {
            emailHtmlContent = fs.readFileSync(templatePath, 'utf8');
      } catch (readError) {
            console.error('Error reading email template file: ', readError);
            throw new functions.https.HttpsError('internal', 'Failed to read email template.', readError.message);
      }

      emailHtmlContent = emailHtmlContent
            .replace('{{otp}}', code)
            .replaceAll('{{playerName}}', playerName)
            .replace('{{failedComment}}', failedComment);

      return emailHtmlContent;
}

async function sendFailedPaymentEmail(to, playerName, failedComment) {
      try {
            await sendEmailWithHTML(to, "[CÓC CẦM CƠ] - GIAO DỊCH GẶP LỖI, LIÊN HỆ ĐỂ ĐƯỢC HỖ TRỢ.", getFailedContent(playerName, failedComment));
      } catch (err) {
            console.error(err);
      }
}

function getSuccessContent(playerName) {
      const templatePath = path.join(__dirname, './templates/successPaymentMail.html');

      let emailHtmlContent;
      try {
            emailHtmlContent = fs.readFileSync(templatePath, 'utf8');
      } catch (readError) {
            console.error('Error reading email template file: ', readError);
            throw new functions.https.HttpsError('internal', 'Failed to read email template.', readError.message);
      }

      emailHtmlContent = emailHtmlContent
            .replaceAll('{{name}}', playerName);

      return emailHtmlContent;
}

async function sendSuccessPaymentEmail(to, playerName) {
      try {
            await sendEmailWithHTML(to, "[CÓC CẦM CƠ] - XÁC NHẬN THANH TOÁN THÀNH CÔNG!", getSuccessContent(playerName));
      } catch (err) {
            console.error(err);
      }
}



export { sendFailedPaymentEmail, sendSuccessPaymentEmail }