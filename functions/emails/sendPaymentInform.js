import { sendEmailWithHTML } from "./email-config.js";

function getFailedContent(playerName, failedComment) {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #f8d7da;">
            <h2 style="color: #721c24;">🔴 Giao Dịch Thất Bại</h2>
            <p>Xin chào ${playerName},</p>
            <p>Chúng tôi rất tiếc thông báo rằng giao dịch của bạn đã <strong>thất bại</strong> vì lý do sau:</p>
            <p style="background: #f5c6cb; padding: 10px; border-radius: 5px;"><strong>Lý do:</strong> ${failedComment}</p>
            <p>Vui lòng liên hệ để được hỗ trợ: </p>
            <p>Zalo: 0362718422</p>
            <p>Duy Khánh (Co-lead dự án)</p>
            <p>Trân trọng,</p>
            <p><strong>COCCAMCO Team</strong></p>
        </div>
      `;
}

async function sendFailedPaymentEmail(to, playerName, failedComment) {
      try {
            await sendEmailWithHTML(to, "[CÓC CẦM CƠ] - GIAO DỊCH GẶP LỖI, LIÊN HỆ ĐỂ ĐƯỢC HỖ TRỢ.", getFailedContent(playerName, failedComment));
      } catch (err) {
            console.error(err);
      }
}

function getSuccessContent(playerName) {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #d4edda;">
            <h2 style="color: #155724;">✅ Chúc Mừng! Thanh Toán Thành Công</h2>
            <p>Xin chào <strong>${playerName}</strong>,</p>
            <p>Chúng tôi xin thông báo rằng giao dịch của bạn đã <strong>thành công</strong>!</p>
            <p style="background: #c3e6cb; padding: 10px; border-radius: 5px;">
                Bạn đã chính thức trở thành <strong>người chơi hợp lệ</strong> của giải đấu <strong>Cóc Cầm Cơ</strong>! 🎉
            </p>
            <p>Thông tin giải đấu và các trận đấu sẽ được gửi tới bạn sớm nhất.</p>
            <p>Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ:</p>
            <p>Zalo: 0362718422</p>
            <p>Duy Khánh (Co-lead dự án)</p>
            <p>Trân trọng,</p>
            <p><strong>COCCAMCO Team</strong></p>
        </div>
      `;
}

async function sendSuccessPaymentEmail(to, playerName) {
      try {
            await sendEmailWithHTML(to, "[CÓC CẦM CƠ] - XÁC NHẬN THANH TOÁN THÀNH CÔNG!", getSuccessContent(playerName));
      } catch (err) {
            console.error(err);
      }
}



export { sendFailedPaymentEmail, sendSuccessPaymentEmail }