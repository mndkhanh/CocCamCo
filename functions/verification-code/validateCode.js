// FIREBASE
import { firestore } from "../firebase-admin.js";
//SOME REFS TO THE FIRESTORE COLLECTION
const verificationCodesRef = firestore.collection("verificationCodes");


/**
 * Checks if there is equality between code inputted from client & 
 * code in firestore
 * 
 * @param {string} email - The email address to associate with the verification code.
 * @param {number} compareCode - The code inputted is received from client.
 * @returns {Promise<Boolean>} : return  `true` if there is equality in codes & has not been expired, other cases will return `false`
 */
async function validateCode(email, compareCode) {
      if (!email || !compareCode) return false;
      try {
            const docSnapShot = await verificationCodesRef.doc(email).get();
            if (!docSnapShot) {
                  console.log('No verification code found for this email.');
                  return false;
            }
            const codeInfo = docSnapShot.data();
            // Check if the code matches and hasn't expired
            if (codeInfo.code === compareCode && codeInfo.expireTime > new Date().getTime()) {
                  return true;  // Code is valid
            } else {
                  console.log('Code is invalid or has expired.');
                  return false;  // Invalid or expired code
            }

      } catch (error) {
            console.log("Error in validate code function: ", error);
            return false;
      }
}

export { validateCode };
