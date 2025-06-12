import { app } from "./firebase-config.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-functions.js";
import { getFirestore, collection, doc, getDoc, query, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const functions = getFunctions(app);
const firestore = getFirestore(app);

//---------------------------------------------------------------------------- some refs to collection
const playersRef = collection(firestore, "players");

//---------------------------------------------------------------------------- DOM elements
const nameTxt = document.getElementById("nameTxt");
const PNTxt = document.getElementById("PNTxt");
const ageTxt = document.getElementById("ageTxt");
const emailTxt = document.getElementById("emailTxt");

const errorNameTxt = document.getElementById("errorNameTxt");
const errorPNTxt = document.getElementById("errorPNTxt");
const errorAgeTxt = document.getElementById("errorAgeTxt");
const errorEmailTxt = document.getElementById("errorEmailTxt");
const errorVerCodeTxt = document.getElementById("errorVerCodeTxt");

const sendEmailBtn = document.getElementById("sendEmailBtn");
const submitBtn = document.querySelector("#submitBtn");
//---------------------------------------------------------------------------- js logic from firebase functions

const emailUsed = httpsCallable(functions, "isEmailUsed");

const availSlot = httpsCallable(functions, "hasAvailSlot");



let countdownInterval = null;

function startCountdown(durationInSeconds, textElement, buttonElement) {
      let remaining = durationInSeconds;
      textElement.textContent = `${remaining}s`;

      // Clear any existing countdown
      if (countdownInterval) {
            clearInterval(countdownInterval);
      }

      // Start new countdown
      countdownInterval = setInterval(() => {
            remaining--;
            if (remaining > 0) {
                  textElement.textContent = `${remaining}s`;
            } else {
                  clearInterval(countdownInterval);
                  countdownInterval = null;
                  textElement.textContent = "Gửi lại";
                  buttonElement.classList.remove("pointer-events-none", "opacity-50");
            }
      }, 1000);
}

function clearCountdown() {
      if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
      }
}

//---------------------------------------------------------------------------- DOM EVENT VALIDATION
function setError(errorTxt, str) {
      if (errorTxt) {
            errorTxt.innerHTML = str;
      }
}

function unsetError(errorTxt) {
      if (errorTxt) {
            errorTxt.innerHTML = "";
      }
}

function unsetErrorAll() {
      errorPNTxt.innerHTML = "";
      errorNameTxt.innerHTML = "";
      errorAgeTxt.innerHTML = "";
      errorEmailTxt.innerHTML = "";
      errorVerCodeTxt.innerHTML = "";
}


// Check Name
function isValidName() {
      if (nameTxt.value == "") {
            setError(errorNameTxt, "*Họ và tên không được để trống.")
            nameTxt.classList.add("error-input");
            return false;
      }

      unsetError(errorNameTxt);
      nameTxt.classList.remove("error-input");
      return true;
}

//check Phone number
function isValidPN() {
      if (PNTxt.value == "") {
            setError(errorPNTxt, "*Số điện thoại không được để trống.");
            PNTxt.classList.add("error-input");
            return false;
      }
      const phonePattern = /^0\d{9}$/;
      if (!phonePattern.test(PNTxt.value)) {
            setError(errorPNTxt, "*Phải đủ 10 số và bắt đầu bằng 0.");
            PNTxt.classList.add("error-input");
            return false;
      }

      unsetError(errorPNTxt);
      PNTxt.classList.remove("error-input");
      return true;
}

// check age
function isValidAge() {
      if (ageTxt.value == "") {
            setError(errorAgeTxt, "*Tuổi không được để trống.");
            ageTxt.classList.add("error-input");
            return false;
      }

      const age = Number(ageTxt.value);
      if (age <= 0 || age >= 100) {
            setError(errorAgeTxt, "*Vui lòng chọn độ tuổi hợp lý.");
            ageTxt.classList.add("error-input");
            return false;
      }

      unsetError(errorAgeTxt);
      ageTxt.classList.remove("error-input");
      return true;
}

//check email
async function isValidEmail() {
      if (emailTxt.value == "") {
            setError(errorEmailTxt, "*Email không được để trống.");
            emailTxt.classList.add("error-input");
            return false;
      }

      const emailPattern = /^.+@.+$/;
      if (!emailPattern.test(emailTxt.value)) {
            setError(errorEmailTxt, "*Email không đúng định dạng.");
            emailTxt.classList.add("error-input");
            return false;
      }

      const response = await emailUsed({ email: emailTxt.value });
      const usedEmail = response.data;
      console.log(usedEmail);
      if (usedEmail) {
            setError(errorEmailTxt, "*Email đã được đăng ký.");
            emailTxt.classList.add("error-input");
            return false;
      }

      unsetError(errorEmailTxt);
      emailTxt.classList.remove("error-input");
      return true;
}

// Function to check if all verification code fields are filled
function areFilledVerificationCode() {
      const codeInputs = document.querySelectorAll("#verificationCodeContainer .code-input");
      let areFilledAll = true;
      for (const input of codeInputs) {
            const validInput = isValidCodeInput(input);
            areFilledAll = areFilledAll && validInput;
      }

      if (areFilledAll) {
            unsetError(errorVerCodeTxt); // Clear error message
      } else {
            setError(errorVerCodeTxt, "*Mã xác minh không được để trống."); // Show error message
      }

      return areFilledAll;
}

function isValidCodeInput(input) {
      if (input.value.trim() === "") {
            input.classList.add("error-input");
            return false;
      } else {
            input.classList.remove("error-input");
            return true;
      }
}




nameTxt.addEventListener("change", isValidName);
PNTxt.addEventListener("change", isValidPN);
ageTxt.addEventListener("change", isValidAge);
emailTxt.addEventListener("change", isValidEmail);


//---------------------------------------------------------------------------- Function get the code from 6-inputs
function getVerificationCode() {
      const codeInputs = document.querySelectorAll('#verificationCodeContainer .code-input');

      let codeStr = '';
      codeInputs.forEach(input => {
            codeStr += input.value;
      });

      // Convert the string to a number base-10. 
      const verificationCode = parseInt(codeStr, 10);

      return verificationCode;
}


//---------------------------------------------------------------------------- DOM BUTTON EVENT TRIGGER

sendEmailBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      // Disable button immediately
      sendEmailBtn.classList.add("pointer-events-none", "opacity-50");

      const bool = await isValidEmail();
      const textSpan = document.getElementById("send-email-text");
      const loadingIcon = document.getElementById("send-email-loading-icon");



      if (!bool) {
            sendEmailBtn.classList.remove("pointer-events-none", "opacity-50");
            return;
      }

      try {
            loadingIcon.style.visibility = "visible";

            const sendEmailWithVerCode = httpsCallable(functions, 'sendEmailWithVerCode');
            const response = await sendEmailWithVerCode({ email: emailTxt.value });
            const codeStatus = response.data;

            loadingIcon.style.visibility = "hidden";

            if (codeStatus && codeStatus.status === "ACTIVE") {
                  setError(errorVerCodeTxt, "*Gửi thành công. Mã sẽ hết hạn sau 2 phút.");

                  startCountdown(120, textSpan, sendEmailBtn);

            } else {
                  setError(errorVerCodeTxt, "*Lỗi khi gửi email. Thử lại.");
                  textSpan.textContent = "Gửi mã mới";
                  clearCountdown();
                  sendEmailBtn.classList.remove("pointer-events-none", "opacity-50");
            }
      } catch (error) {

            console.error("Error calling sendEmail:", error);
            clearCountdown();
            setError(errorVerCodeTxt, "*Lỗi khi gửi email. Thử lại.");
            loadingIcon.style.visibility = "hidden";
            textSpan.textContent = "Gửi lại";
            sendEmailBtn.classList.remove("pointer-events-none", "opacity-50");
      }
});



// --------------------------------- submit form 
submitBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      // Disable button immediately
      submitBtn.classList.add("pointer-events-none", "opacity-50");

      // Validate all inputs
      const isNameValid = isValidName();
      const isPhoneValid = isValidPN();
      const isAgeValid = isValidAge();
      const isEmailValid = await isValidEmail();
      const areVerificationCodeFilled = areFilledVerificationCode();

      const response = await availSlot();
      const anyLeftSlot = response.data;

      // If any validation fails, stop the submission
      if (!(isNameValid && isPhoneValid && isAgeValid && isEmailValid && areVerificationCodeFilled)) {
            setTimeout(() => {
                  submitBtn.classList.remove("pointer-events-none", "opacity-50");
            }, 2000); // 5 giây
            return;
      }

      // Check if there are any empty slots
      if (!anyLeftSlot) {
            setFailureWindow("Giải đấu đã nhận đủ đơn đăng ký. Chúng tôi sẽ cập nhật khi có các thông tin mới nhất.");
            setTimeout(() => {
                  submitBtn.classList.remove("pointer-events-none", "opacity-50");
            }, 2000);
            return;
      }

      try {
            setLoadingEffect();

            const sendRegisterForm = httpsCallable(functions, 'sendRegisterForm');
            const playerInfo = {
                  name: nameTxt.value,
                  phoneNumber: PNTxt.value,
                  age: Number(ageTxt.value.trim()),
                  email: emailTxt.value,
                  code: getVerificationCode(),
            }

            const response = await sendRegisterForm(playerInfo);
            const registerStatus = await response.data;
            const status = registerStatus.status;
            const comment = registerStatus.comment;

            unsetLoadingEffect();

            if (status === "SUCCESS") {
                  setSuccessWindow();
                  unsetErrorAll();
                  clearForm();
            } else {
                  setFailureWindow(comment);
            }

      } catch (error) {
            unsetLoadingEffect();
            setFailureWindow("Lỗi hệ thống, chụp lại màn hình lỗi để được hỗ trợ: " + error);
            console.error('Error calling sendRegisterForm:', error);
      } finally {
            // Re-enable after 2s
            setTimeout(() => {
                  submitBtn.classList.remove("pointer-events-none", "opacity-50");
            }, 2000);
      }
});


function setFailureWindow(comment) {
      document.querySelector(".message-box-wrapper-failure").classList.add("active");
      document.querySelector("#error-message-text").innerHTML = comment;
}

function setSuccessWindow() {
      document.querySelector(".message-box-wrapper-success").classList.add("active");
}

function setLoadingEffect() {
      document.querySelector("#loading-effect-dialog").showModal();
}

function unsetLoadingEffect() {
      document.querySelector("#loading-effect-dialog").close();
}


// --------------------------------- ending submit form 



function clearForm() {
      // Xóa nội dung các trường input
      nameTxt.value = "";
      PNTxt.value = "";
      ageTxt.value = "";
      emailTxt.value = "";

      // Xóa các input mã xác thực
      const codeInputs = document.querySelectorAll(".code-input");
      codeInputs.forEach(input => input.value = "");

      // Xóa thông báo lỗi
      unsetErrorAll();

      // Bật lại nút gửi mã và đổi nội dung
      const sendEmailBtn = document.getElementById("sendEmailBtn");
      const sendEmailText = document.getElementById("send-email-text");
      const sendEmailLoadingIcon = document.getElementById("send-email-loading-icon");

      // Bỏ disable bằng class
      sendEmailBtn.classList.remove("pointer-events-none", "opacity-50");

      // Bật lại pointer
      sendEmailBtn.style.pointerEvents = "auto";

      // Đặt lại nội dung
      sendEmailText.textContent = "Gửi mã";

      // Ẩn icon loading
      sendEmailLoadingIcon.style.visibility = "hidden";
      clearCountdown();
}








