import { firestore } from "../firebase-admin.js";
import functions from "firebase-functions"
import { validateCode } from "../verification-code/validateCode.js";
import { generatePaymentInfo } from "../player-payment/generatePaymentInfo.js";
import { sendSuccessRegister } from "../emails/sendSuccessRegister.js";

//SOME REFS TO THE FIRESTORE COLLECTION
const playersRef = firestore.collection("players");

async function isEmailUsed(email) {
      const docSnap = await playersRef.doc(email).get();
      return docSnap.exists;
}

async function hasAvailSlot() {
      const querySnapShot = await playersRef.get();
      const currentNumOfSlots = querySnapShot.size; // Count documents
      return 32 - currentNumOfSlots > 0;

}

// Check Name
function isValidName(name) {
      return name != "";
}

//check Phone number
function isValidPN(phoneNumber) {
      if (phoneNumber == "") {
            console.log("Số điện thoại trống.");
            return false;
      }
      const phonePattern = /^0\d{9}$/;
      if (!phonePattern.test(phoneNumber)) {
            console.log("Phải đủ 10 số và bắt đầu bằng 0.");
            return false;
      }
      return true;
}

// check age
function isValidAge(age) {
      // Check if the age is a valid number
      if (!age || typeof age !== "number" || isNaN(age)) {
            console.log("Tuổi trống hoặc không phải số.");
            return false;
      }

      if (age <= 0 || age >= 100) {
            console.log("Vui lòng chọn độ tuổi hợp lý.");
            return false;
      }

      return true;
}

//check gender 
function isValidGender(gender) {

      if (gender !== "Nam" && gender !== "Nữ") {
            console.log("Vui lòng chọn giới tính là Nam hoặc Nữ.");
            return false;
      }

      return true;
}

// check hạng
function isValidRank(rank) {
      if (rank !== "G" && rank !== "H" && rank !== "I") {
            console.log("Vui lòng chọn đúng rank G-H-I.");
            return false;
      }
      return true;
}

// check colege
function isValidColege(college) {
      if (college === "") {
            console.log("Trường đại học không được để trống.");
            return false;
      }
      return true;
}


//check email
async function isValidEmail(email) {
      if (email == "") {
            console.log("Email trống.");
            return false;
      }

      const emailPattern = /^.+@.+$/;
      if (!emailPattern.test(email)) {
            console.log("Email không đúng định dạng.");
            return false;
      }

      const emailUsed = await isEmailUsed(email);
      if (emailUsed) {
            console.log("Email đã được đăng ký.");
            return false;
      }

      return true;
}

//check code 
async function isValidCode(email, code) {
      const okCode = await validateCode(email, code);
      return okCode;
}

async function validateAllFields(name, phoneNumber, age, gender, rank, college, email) {
      if (!isValidName(name)) {
            return false;
      }

      if (!isValidPN(phoneNumber)) {
            return false;
      }

      if (!isValidAge(age)) {
            return false;
      }

      if (!isValidGender(gender)) {
            return false;
      }

      if (!isValidRank(rank)) {
            return false;
      }

      if (!isValidColege(college)) {
            return false;
      }

      const validEmail = await isValidEmail(email);
      if (!validEmail) {
            return false;
      }
      return true;
}


/**
 * Firebase function to handle player registration.
 */
const sendRegisterForm = functions.https.onCall(async (request) => {
      let registerStatus = {
            status: "",
            comment: ""
      };

      try {
            // Ensure player data is provided
            const playerInfo = request.data;

            if (!playerInfo) {
                  registerStatus.status = "FAILED";
                  registerStatus.comment = "No player data provided.";
                  return registerStatus;
            }

            const { email, name, phoneNumber, age, gender, rank, college, code } = playerInfo;

            // Check if slots are available
            const leftSlot = await hasAvailSlot();
            if (!leftSlot) {
                  registerStatus.status = "FAILED";
                  registerStatus.comment = "Giải đã nhận đủ số lượng người. Chúng tôi sẽ cập nhật khi có thông tin mới nhất.";
                  return registerStatus;
            }

            // Validate all fields
            const isValidAll = await validateAllFields(name, phoneNumber, age, gender, rank, college, email);
            if (!isValidAll) {
                  registerStatus.status = "FAILED";
                  registerStatus.comment = "Thông tin không đúng định dạng hoặc gặp lỗi. Hãy thử lại!";
                  return registerStatus;
            }

            // Validate code
            const validCode = await isValidCode(email, code)
            if (!validCode) {
                  registerStatus.status = "FAILED";
                  registerStatus.comment = "Mã đã hết hạn hoặc không đúng. Hãy thử lại.";
                  return registerStatus;
            }


            // Save the player to the database
            const actualStorePlayerData = {
                  email,
                  name,
                  phoneNumber,
                  age,
                  gender,
                  rank,
                  college,
                  registerTime: new Date().getTime(),
            }
            await playersRef.doc(email).set(actualStorePlayerData);



            // Generate payment info for the player
            const successGeneratePayment = await generatePaymentInfo(email, name);
            if (!successGeneratePayment) {
                  console.log("Generate payment info for", email, "went to error. Check again.");
            }


            // Send email register successfully
            const sendSuccessMail = await sendSuccessRegister(actualStorePlayerData);
            if (!sendSuccessMail) {
                  console.log("Send success registration failed to the email: ", email);
            }


            registerStatus.status = "SUCCESS";
            registerStatus.comment = "Đăng ký thành công. Vui lòng chờ các thông báo tiếp theo.";
            return registerStatus;
      } catch (error) {
            console.error("Error registering player:", error);
            registerStatus.status = "FAILED";
            registerStatus.comment = "Lỗi server. Vui lòng liên hệ để được hỗ trợ";
            return registerStatus;
      }
});


export { sendRegisterForm };