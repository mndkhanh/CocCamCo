import { transporter } from "./email-config.js";

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