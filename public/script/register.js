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
const emailTxt = document.getElementById("emailTxt");
const sendEmailBtn = document.getElementById("sendEmailBtn");

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
 * Checks if there are any left slots
 * 
 * @returns {Promise<boolean>}
 * 
 */
async function hasAvailSlot() {
      const querySnapShot = await getDocs(playersRef);
      const currentNumOfSlots = querySnapShot.size;
      return 32 - currentNumOfSlots > 0;
}



//---------------------------------------------------------------------------- DOM EVENT TRIGGER
emailTxt.addEventListener("change", async () => {
      if (await isEmailUsed()) {
            alert("Email đã được đăng ký. Vui lòng chọn email khác!");
            return;
      }
});

sendEmailBtn.addEventListener("click", async () => {
      if (await isEmailUsed()) {
            alert("Email đã được đăng ký. Vui lòng chọn email khác!");
            return;
      }
      if (await !hasAvailSlot()) {
            alert("Giải đấu đã nhận đủ đơn đăng ký. Chúng tôi sẽ cập nhật khi còn slot trống");
            return;
      }



})





