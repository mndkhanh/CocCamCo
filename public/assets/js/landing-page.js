import { TOURNAMENT_INFO } from "../../script/tournament-info.js";

// Ngày kết thúc (thay đổi theo nhu cầu)
const targetDate = new Date(TOURNAMENT_INFO.REGISTRATION_DEADLINE).getTime();

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

const slider = document.getElementById('slider');
const images = slider.children;
const totalImages = images.length;
let index = 0;

function showSlide(i) {
      index = i;
      slider.style.transform = `translateX(-${index * 100}%)`;
}

document.getElementById('next').addEventListener('click', () => {
      showSlide((index + 1) % totalImages);
      resetAutoSlide();
});

document.getElementById('prev').addEventListener('click', () => {
      showSlide((index - 1 + totalImages) % totalImages);
      resetAutoSlide();
});

// Tự động chuyển slide mỗi 3 giây
let autoSlide = setInterval(() => {
      showSlide((index + 1) % totalImages);
}, 3000);

// Khi người dùng bấm nút thì reset lại thời gian tự động
function resetAutoSlide() {
      clearInterval(autoSlide);
      autoSlide = setInterval(() => {
            showSlide((index + 1) % totalImages);
      }, 3000);
}