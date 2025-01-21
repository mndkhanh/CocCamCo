import { app } from "./firebase-config.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-functions.js";
import { getFirestore, collection, doc, getDoc, query, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const functions = getFunctions(app);
const firestore = getFirestore(app);


//---------------------------------------------------------------------------- some refs to collection
const playersRef = collection(firestore, "players");
const verificationCodesRef = collection(firestore, "verificationCodes");
const testRef = collection(firestore, "test");



//---------------------------------------------------------------------------- DOM elements
const nameTxt = document.getElementById("nameTxt");
const emailTxt = document.getElementById("emailTxt");
const sendEmailBtn = document.getElementById("sendEmailBtn");
const checkCodeBtn = document.getElementById("checkCodeBtn");

//---------------------------------------------------------------------------- DOM elems with error text
const nameErrorTxt = document.getElementById("nameErrorTxt");
const emailErrorTxt = document.getElementById("emailErrorTxt");
const codeErrorTxt = document.getElementById("codeErrorTxt");


//---------------------------------------------------------------------------- js logic

/**
 * Checks if the given email is already used by any other players.
 *
 * @async
 * @function isEmailUsed
 * @returns {Promise<boolean>} - Returns `true` if the email is found in the players collection, otherwise `false`.
 */
async function isEmailUsed() {
      const email = emailTxt.value;
      const docRef = doc(playersRef, email);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
}


/**
 * 
 * Checks if the code has been sent yet.
 * 
 * @returns {Promise<boolean>} 
 * - return `true` if the email is found in the verificationCodes collection
 * - return `false` in case: the email is not found in the verificationCodes collection
 * - not catch the code is expired
 */
async function isCodeSent() {
      const email = emailTxt.value;
      const docRef = doc(verificationCodesRef, email);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
}


/**
 * 
 * Checks if the code is expired
 * 
 * This is going to check the email document in verficationCodes collection
 * 
 * @returns Promise<boolean>} 
 * - return true if code of given email is expired
 * - return false in cases:
 * - 1. the code has not been sent
 * - 2. the code of a given email is not expired yet
 */
async function isCodeExpired() {
      if (!isCodeSent) return false;
      const email = emailTxt.value;
      const docRef = doc(verificationCodesRef, email);
      const docSnap = await getDoc(docRef);
      const expiredTime = docSnap.data().expiredTime;
      return (new Date().getTime() - expiredTime) >= 0;
}

/**
 * 
 * Checks if there are any left slots
 * 
 * 
 * 
 */
async function hasAvailSlot() {
      const querySnapShot = await getDocs(playersRef);
      const currentNumOfSlots = querySnapShot.size;
      return 32 - currentNumOfSlots > 0;
}



//---------------------------------------------------------------------------- JS MANIPULATE VIEWS AND DATAS
function unsetErrorTxt(errorTxtElem) {
      if (!errorTxtElem) return;
      errorTxtElem.innerHTML = " ";
}

function setErrorTxt(errorTxtElem, errorStr) {
      if (!errorTxtElem) return;
      errorTxtElem.textContent = errorStr;
}

function clearData() {
      nameTxt.textContent = "";
      nameErrorTxt.textContent = "";
      emailTxt.textContent = "";
      emailErrorTxt.textContent = "";
}




//---------------------------------------------------------------------------- DOM EVENT TRIGGER
emailTxt.addEventListener("change", () => {

      isEmailUsed()
            .then(result => {
                  if (result) {
                        console.log("choose another account");
                        setErrorTxt(emailErrorTxt, "*Email đã được đăng ký. Vui lòng chọn email khác!");
                  } else {
                        unsetErrorTxt(emailErrorTxt);
                  }
            })
            .catch(error => {
                  console.log(error);
            })
});

sendEmailBtn.addEventListener("click", async () => {
      if (await isEmailUsed()) {
            setErrorTxt(emailErrorTxt, "*Email đã được đăng ký. Vui lòng chọn email khác!");
            return;
      }
      if (await isCodeExpired()) {
            alert("Mã xác nhận đã hết hạn. Vui lòng gửi lại và sử dụng mã khác");
            return;
      }
      if (await !hasAvailSlot()) {
            alert("Giải đấu đã nhận đủ đơn đăng ký. Chúng tôi sẽ cập nhật khi còn slot trống");
            return;
      }
      

})





