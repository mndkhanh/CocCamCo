// FIREBASE
import { firestore } from "../firebase-admin.js";
// UTILS
import { generateIntCode } from "../utils/index.js";
//SOME REFS TO THE FIRESTORE COLLECTION
const verificationCodesRef = firestore.collection("verificationCodes");

/**
 * Generate a verification code and store it in Firestore
 * 
 * @param {string} email - The email address to associate with the verification code.
 * @returns {Promise<void>}
 */
async function generateCode(email) {
      if (!email) return;
      try {
            const codeInfo = {
                  code: generateIntCode(6), // Generates a 6-digit number, min is 100,000
                  startTime: new Date().getTime(),
                  expireTime: new Date().getTime() + 2 * 60 * 1000 // Code expires in 2 minutes
            };
            await verificationCodesRef.doc(email).set(codeInfo);
            console.log(`Verification code for ${email} generated and stored in Firestore: \n`, codeInfo);
            return codeInfo.code;
      } catch (error) {
            console.log("Error in generateCode function: ", error);
      }
}

export { generateCode };
