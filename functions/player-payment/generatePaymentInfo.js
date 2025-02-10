import { firestore } from "../firebase-admin.js";
import { PAYMENT_STATIC_INFO } from "./payment-static-info.js";
//SOME REF TO COLLECTIONS
const playersRef = firestore.collection("players");
const paymentInfoRef = firestore.collection("paymentInfo");



//----------------------------------------------------------------------------
/**
 * Converts any input into a URL-safe string.
 * @param {any} input - The input to convert (can be a string, number, or other types).
 * @returns {string} URL-safe string with spaces encoded as "%20".
 */
function convertToURLString(input) {
      if (input === null || input === undefined) {
            return ""; // Return an empty string for null or undefined
      }

      // Convert input to string and trim whitespace
      const str = input.toString().trim();

      // Encode all special characters, including spaces as "%20"
      return encodeURIComponent(str);
}

const {
      BANK_ACCOUNT,
      ACCOUNT_NAME,
      BANK_NAME,
      BANK_ID,
      PAYMENT_AMOUNT,
      PAYMENT_EXPIRATION_TIME_AMOUNT
} = PAYMENT_STATIC_INFO;

function getBankID() {
      return convertToURLString(BANK_ID);
}

function getBankAccount() {
      return convertToURLString(BANK_ACCOUNT);
}

function getPaymentAmount() {
      return convertToURLString(PAYMENT_AMOUNT);
}

function getAccountName() {
      return convertToURLString(ACCOUNT_NAME);
}

function getBankingContent(paymentID) {
      return convertToURLString("COCCAMCO " + paymentID);
}

// endpoint api of VIETQR
function getQRBankingURL(paymentID) {
      return `https://img.vietqr.io/image/${getBankID()}-${getBankAccount()}-print.png?amount=${getPaymentAmount()}&addInfo=${getBankingContent(paymentID)}&accountName=${getAccountName()}&fbclid=IwZXh0bgNhZW0CMTEAAR15DQyb2vwaU9cG5tpWt7w31udUCeFOqogpxV834ela1qh2SN5Wb40US2Y_aem_I4MNYj-yqWkWEh79a73zwA`;
}
function generateUniqueIDPayment() {
      const timestampPart = new Date().getTime().toString().slice(-4); // Last 4 digits of the timestamp
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 random Base36 characters
      return timestampPart + randomPart;
}


//------------------------------------------------------------------//>>>>>>>>


async function isPlayerRegistered(email) {
      const playerInfo = await playersRef.doc(email).get();
      return playerInfo.exists;
}

async function isPaymentInfoActive(email) {
      const personalPaymentInfo = await paymentInfoRef.doc(email).get();
      if (!personalPaymentInfo.exists) {
            console.log("The player payment's info is not generated yet");
            return false;
      }

      //THERE ARE: ERROR, SUCCESS, PENDING
      const paymentStatus = personalPaymentInfo.data().paymentStatus;
      console.log(paymentStatus);
      if (paymentStatus == "ERROR") {
            console.log("The player payment status went to error");
            return false;
      }
      if (paymentStatus == "SUCCESS") {
            console.log("The player is already paid for the fee");
            return true;
      }
      const isInUse = new Date().getTime() < personalPaymentInfo.data().expireTime;
      return isInUse;
}



async function generatePaymentInfo(email, name) {
      if (!email) return false;

      const isRegistered = await isPlayerRegistered(email);
      console.log(isRegistered);
      if (!isRegistered) return false;

      const isPaymentActive = await isPaymentInfoActive(email);
      console.log(isPaymentActive);
      if (isPaymentActive) return false;

      const paymentID = generateUniqueIDPayment();
      console.log(paymentID);

      const personalPaymentInfo = {
            qrBanking: getQRBankingURL(paymentID),
            paymentStatus: "PENDING", // FAILED & PAID
            generateTime: new Date().getTime(),
            paymentTime: 0,
            expireTime: new Date().getTime() + PAYMENT_EXPIRATION_TIME_AMOUNT, // in 48h,
            paymentID: paymentID,
            email: email,
            name: name

      }
      try {
            await paymentInfoRef.doc(email).set(personalPaymentInfo);
            console.log("Created payment info successfully for ", email);
            return true;
      } catch (err) {
            console.log("Error in generate payment info for player", err);
            return false;
      }
}

export { generatePaymentInfo };