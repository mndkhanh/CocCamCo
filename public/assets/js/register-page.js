import { TOURNAMENT_INFO } from "../../script/tournament-info.js";

document.querySelectorAll('.code-input').forEach((input, index, inputs) => {
      input.addEventListener('input', (e) => {
            // Ensure only a single digit is entered by restricting the input value
            if (e.target.value.length > 1) {
                  e.target.value = e.target.value[0]; // Keep only the first digit
            }

            // Move focus to the next input field if the current one has a value
            if (e.target.value.length > 0 && index < inputs.length - 1) {
                  inputs[index + 1].focus();
            }
      });

      input.addEventListener('keydown', (e) => {
            // Handle Backspace key to move focus to the previous input field
            if (e.key === 'Backspace') {
                  if (input.value.length === 0 && index > 0) {
                        // Move focus to the previous input field if current one is empty
                        inputs[index - 1].focus();
                  } else if (input.value.length > 0) {
                        // If the current input has a value, delete the value without moving focus
                        input.value = '';
                  }
            }

            // Handle ArrowLeft and ArrowRight to navigate between inputs
            else if (e.key === 'ArrowLeft' && index > 0) {
                  inputs[index - 1].focus();
            } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
                  inputs[index + 1].focus();
            }
      });

      // Prevent unwanted non-numeric input characters
      input.addEventListener('input', (e) => {
            // Allow only digits 0-9
            if (!/^[0-9]$/.test(e.target.value)) {
                  e.target.value = ''; // Clear the input if non-numeric value is entered
            }
      });
});

let codeInputs = document.querySelectorAll("#verificationCodeContainer input");
codeInputs[0].addEventListener("paste", (e) => {
      const pasteData = e.clipboardData.getData("text").split("");
      codeInputs.forEach((input, index) => {
            input.value = pasteData[index] || "";
      });
      codeInputs[pasteData.length - 1]?.focus();
});

document.querySelector("#btnCloseSuccessMessageBox").addEventListener("click", () => {
      document.querySelector(".message-box-wrapper-success").classList.remove("active");
})
document.querySelector("#btnCloseFailureMessageBox").addEventListener("click", () => {
      document.querySelector(".message-box-wrapper-failure").classList.remove("active");
})


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

