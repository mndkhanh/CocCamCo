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

// Trigger the email sending when the button is clicked
sendEmailBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const bool = await isValidEmail();
      if (!bool) {
            return;
      }
      try {
            //loading effect
            document.querySelector("#send-email-loading-icon").style = "visibility: visible;";
            // Call the Firebase Cloud Function to send an email
            const sendEmailWithVerCode = httpsCallable(functions, 'sendEmailWithVerCode');

            const response = await sendEmailWithVerCode({ email: emailTxt.value });
            const codeStatus = response.data;
            document.querySelector("#send-email-loading-icon").style = "visibility: hidden;";
            if (codeStatus && codeStatus.status === "ACTIVE") setError(errorVerCodeTxt, "*Gửi thành công. Mã sẽ hết hạn sau 2 phút.");
            else setError(errorVerCodeTxt, "*Lỗi khi gửi email. Try again.");
      } catch (error) {
            console.error('Error calling sendEmail:', error);
            setError(errorVerCodeTxt, "*Lỗi khi gửi email. Try again.");
      }
});


// --------------------------------- submit form 
submitBtn.addEventListener("click", async (e) => {
      e.preventDefault();

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
            return;
      }

      // Check if there are any empty slots
      if (!anyLeftSlot) {
            //set the failure window to have below failed detail
            setFailureWindow("Giải đấu đã nhận đủ đơn đăng ký. Chúng tôi sẽ cập nhật khi có các thông tin mới nhất.");
            return;
      }

      try {
            // set loading effect to be active
            setLoadingEffect();

            //send registration form
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
            // check the register status
            if (status === "SUCCESS") { // successfully submitted
                  // unset loading effect
                  unsetLoadingEffect();
                  //show success registration window
                  setSuccessWindow();
                  //set the form empty
                  unsetErrorAll();
            } else { // failure
                  // unset loading effect
                  unsetLoadingEffect();
                  // show failure window 
                  setFailureWindow(comment);
            }


      } catch (error) {
            // unset loading effect and show failure window
            unsetLoadingEffect();
            setFailureWindow("Lỗi hệ thống, chụp lại màn hình lỗi để được hỗ trợ: " + error);
            console.error('Error calling sendRegisterForm:', error);
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







