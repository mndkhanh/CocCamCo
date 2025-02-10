import { firestore } from "../firebase-admin.js";

//SOME REFS TO THE FIRESTORE COLLECTION
const verificationCodesRef = firestore.collection("verificationCodes");

/**
 * 
 * Checks if 
 * 
 * @param {string} email 
 * @returns {Object} which include 3 fields: email, status, comment:
 * - Status is `INACTIVE` in cases:
 *    + 
 *    + 
 * - Status is `ACTIVE` in cases:
 * 
 */
async function getCodeStatus(email) {
      let codeStatus = {
            email: "",
            status: "",
            comment: ""
      }
      if (!email) {
            codeStatus.email = "";
            codeStatus.status = "INACTIVE";
            codeStatus.comment = "Email rỗng";
            return codeStatus;
      }
      try {
            const docSnapShot = await verificationCodesRef.doc(email).get();
            if (!docSnapShot) {
                  codeStatus.email = email;
                  codeStatus.status = "INACTIVE";
                  codeStatus.comment = "Chưa gửi mã xác minh."
            } else {
                  const codeInfo = docSnapShot.data();
                  const expireTime = codeInfo.expireTime;
                  if (expireTime > new Date().getTime()) {
                        codeStatus.email = email;
                        codeStatus.status = "ACTIVE";
                        codeStatus.comment = "Mã còn hạn."
                  } else {
                        codeStatus.email = email;
                        codeStatus.status = "INACTIVE";
                        codeStatus.comment = "Mã hết hạn."
                  }
            }
            return codeStatus;
      } catch (error) {
            console.error("Error in getCodeStatus function: ", error);
      }
}

export { getCodeStatus };