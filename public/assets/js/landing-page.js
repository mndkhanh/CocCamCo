// Ngày kết thúc (thay đổi theo nhu cầu)
const targetDate = new Date("2025-10-10T00:00:00").getTime();

function updateCountdown() {
      const now = new Date().getTime();
      const timeLeft = targetDate - now;

      if (timeLeft <= 0) {
            document.getElementById("register-noti").innerText = "Đã đóng form đăng ký!";
            document.getElementById("day").innerText = "00";
            document.getElementById("hour").innerText = "00";
            document.getElementById("minute").innerText = "00";
            document.getElementById("second").innerText = "00";
            return;
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      document.getElementById("day").innerText = String(days).padStart(2, '0');
      document.getElementById("hour").innerText = String(hours).padStart(2, '0');
      document.getElementById("minute").innerText = String(minutes).padStart(2, '0');
      document.getElementById("second").innerText = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);

updateCountdown();

