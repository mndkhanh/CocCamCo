import { transporter } from "./email-config.js";

function getVNDate(timestamp) { //Format: 16:52:01 25/01/2025
      return new Date(timestamp).toLocaleString('vi-VN', {
            day: '2-digit',    // Day (e.g., 25)
            month: '2-digit',  // Month (e.g., 01)
            year: 'numeric',   // Year (e.g., 2025)
            hour: '2-digit',   // Hour in 24-hour format (e.g., 14)
            minute: '2-digit', // Minute (e.g., 30)
            second: '2-digit', // Second (e.g., 45)
            hour12: false,     // 24-hour clock
      });
}

/**
 * Function to send a success registration email after player registration & payment info
 */
async function sendSuccessRegister(playerInfo) {
      const { email, name, phoneNumber, age, registerTime } = playerInfo;

      const emailContent = `
          <p>Xin chào ${name},</p>
          <p>Bạn đã gửi đơn đăng ký thành công. Sau đây là thông tin đăng ký:</p>
          <p><strong>Player Info:</strong></p>
          <ul>
              <li><strong>Name:</strong> ${name}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Phone Number:</strong> ${phoneNumber}</li>
              <li><strong>Age:</strong> ${age}</li>
              <li><strong>Registration Time:</strong> ${getVNDate(registerTime)}</li>
          </ul>
          <p>Thank you for joining us.</p>
          <p>Best regards,<br>Your Team</p>
      `;

      // Configure the email options
      const mailOptions = {
            from: 'coccamco.fpthcm@gmail.com',
            to: email,
            subject: '[CÓC CẦM CƠ] - GỬI ĐƠN ĐĂNG KÝ THÀNH CÔNG & THÔNG BÁO THANH TOÁN LỆ PHÍ THAM GIA',
            html: emailContent
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