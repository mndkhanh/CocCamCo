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
                  <li><strong>Họ và tên:</strong> ${name}</li>
                  <li><strong>Email:</strong> ${email}</li>
                  <li><strong>Số điện thoại:</strong> ${phoneNumber}</li>
                  <li><strong>Tuổi:</strong> ${age}</li>
                  <li><strong>Đăng ký vào lúc:</strong> ${getVNDate(registerTime)}</li>
            </ul>
            <p><strong>Vui lòng thanh toán trong vòng 48 giờ để trở thành thí sinh chính thức. Tra cứu thông tin thanh toán ở
                        đường link sau:</strong></p><br>
            <a href="https://coccamco.web.app/search">https://coccamco.web.app/search</a>

            <p>Vui lòng đợi các thông tin mới nhất từ chúng tôi.</p>
            <p>Best regards,<br>Cóc Cầm Cơ</p>
      `;

      // Configure the email options
      const mailOptions = {
            from: 'coccamco.fpthcm@gmail.com',
            to: email,
            subject: '[CÓC CẦM CƠ] - THÔNG BÁO ĐĂNG KÝ THÀNH CÔNG & THANH TOÁN LỆ PHÍ THAM GIA',
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