import { app } from "./firebase-config.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-functions.js";
import { getFirestore, collection, doc, getDoc, query, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const functions = getFunctions(app);
const firestore = getFirestore(app);

// some refs to collection
const playersRef = collection(firestore, "players");
const verificationCodesRef = collection(firestore, "verificationCodes");
const testRef = collection(firestore, "test");

// DOM elements
const nameTxt = document.getElementById("nameTxt");
const emailTxt = document.getElementById("emailTxt");
const sendEmailBtn = document.getElementById("sendEmailBtn");
const checkCodeBtn = document.getElementById("checkCodeBtn");


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
 * - return `false` in case:
 * - 1. the email is not found in the verificationCodes collection
 * - 2. the email is found, but the code was expired
 */
async function isCodeSent() {
      const email = emailTxt.value;
      const
}


/**
 * 
 * @returns 
 */
function isCodeExpired(comparedEmail,) {
      const email = emailTxt.value;
}


emailTxt.addEventListener("change", async () => {
      if (await isEmailUsed()) {
            console.log("choose another account");
            // TODO here



      }
});

