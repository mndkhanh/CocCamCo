import 'dotenv/config';
import crypto from 'crypto';
import functions from "firebase-functions";
import { firestore } from "../firebase-admin.js";
import { PAYMENT_STATIC_INFO } from "./payment-static-info.js";
import { sendFailedPaymentEmail, sendSuccessPaymentEmail } from "../emails/sendPaymentInform.js"
import cors from "cors";
import { sendEmailWithText } from '../emails/email-config.js';
const corsHandler = cors({ origin: true }); // Allow all origins



/**
 * This is used to get the array of data from paymentInfo collection in firebase firestore
 * 
 * @returns {Array}
 */
async function getDataCollectionFromPaymentInfo() {
      const data = [];
      const querySnapshot = await firestore.collection("paymentInfo").get();
      querySnapshot.forEach(doc => {
            data.push(doc.data());
      });
      return data;
}


/**
 * This function is used to manipulate the playerPaymentInfo to paid status
 * & set the paymentTime to paymentTime param
 * 
 * @param {String} email 
 * @param {Number} paymentTime 
 */
async function setPlayerPaymentPaidStatus(email, paymentTime) {
      try {
            await firestore.collection("paymentInfo").doc(email).update({
                  paymentStatus: "PAID",
                  paymentTime: paymentTime
            })
      } catch (error) {
            console.error("Error when trying to set player payment status to PAID:" + error);
      }
}

/**
 * This functions is used to manipulate playerPaymentInfo to FAILED status
 * & add the failure reason thru field "comment"
 * 
 * @param {String} email 
 * @param {Number} paymentTime 
 * @param {String} comment
 */
async function setPlayerPaymentFailedStatus(email, paymentTime, comment) {
      try {
            await firestore.collection("paymentInfo").doc(email).update({
                  paymentStatus: "FAILED",
                  paymentTime: paymentTime,
                  comment: comment
            })
      } catch (error) {
            console.error("Error when trying to set player payment status to FAILED:" + error);
      }
}

/**
 * 
 * This is used to retrieve the paymentInfo of a person from paymentID
 * 
 * @param {Array} paymentArr 
 * @param {String} paymentID 
 * @returns {Object|null} paymentInfo
 */
function retrievePaymentInfoByPaymentID(paymentArr, paymentID) {
      for (const paymentInfo of paymentArr) {
            if (paymentInfo.paymentID === paymentID) return paymentInfo;
      }
      return null;
}


function sortObjDataByKey(data) {
      const sortedObj = {};
      Object.keys(data).sort().forEach((key) => {
            if (typeof data[key] === "object" && data[key] !== null) {
                  sortedObj[key] = sortObjDataByKey(data[key]);
            } else {
                  sortedObj[key] = data[key];
            }
      });
      return sortedObj;
}


/**
 * Hàm kiểm tra signature của Casso
 * @param {string} signatureHeader - giá trị header "x-casso-signature"
 * @param {object} body - dữ liệu request body (object)
 * @param {string} secretKey - key bí mật của server
 * @returns {boolean} - true nếu hợp lệ, false nếu không
 */
function verifyCassoSignature(signatureHeader, body, secretKey) {
      if (!signatureHeader) return false;

      const [timestampPart, signaturePart] = signatureHeader.split(",");
      if (!timestampPart || !signaturePart) return false;

      const timestamp = timestampPart.split("=")[1];
      const signature = signaturePart.split("=")[1];
      if (!timestamp || !signature) return false;

      const sortedBody = sortObjDataByKey(body);
      const rawBody = JSON.stringify(sortedBody);
      const signedPayload = `${timestamp}.${rawBody}`;

      const expectedSignature = crypto
            .createHmac("sha512", secretKey)
            .update(signedPayload)
            .digest("hex");

      return signature === expectedSignature;
}


/**
 * This is a https trigger whenever be called, aims to 
 * check payment info and modify the payment status of clients.
 * 
*/
const checkPlayerPayment = functions.https.onRequest((request, response) => {
      corsHandler(request, response, async () => {

            await sendEmailWithText('mndkhanh@gmail.com', 'Cóc Cầm Cơ - Chú ý! Có ip request tới cloud function check payment!',
                  `Nếu bạn nhận được nhiều mail này. rất có thể bạn đang bị spam request và có người đagn cố gắng hack payment.`);

            const serverSecretKey = process.env.CASSO_SECRET_KEY;
            const signatureHeader = request.headers["x-casso-signature"];
            console.log(serverSecretKey);
            console.log(signatureHeader);
            // Xác thực chữ ký trước khi xử lý tiếp
            if (!verifyCassoSignature(signatureHeader, request.body, serverSecretKey)) {
                  console.warn("Invalid or missing Casso signature");
                  return response.status(401).send("Unauthorized");
            }

            console.log("successfully verify");

            const transaction = request.body.data;
            if (!transaction) {
                  console.error("transaction does not exist");
                  return response.status(400).send("transaction does not exist");
            }

            console.log(transaction);

            try {
                  // Lấy danh sách playerPayments từ Firestore
                  const playerPayments = await getDataCollectionFromPaymentInfo();

                  // Lấy description trong transaction để xử lý
                  const description = transaction.description;

                  if (!description.includes("COCCAMCO")) {
                        console.log("Description does not contain COCCAMCO, ignore transaction");
                        return response.status(200).send("Ignored: description not matching");
                  }

                  const match = description.match(/COCCAMCO\s([A-Za-z0-9]{10})/);

                  if (!match) {
                        console.log("Description does not match pattern, ignore transaction");
                        return response.status(200).send("Ignored: description pattern not matched");
                  }

                  const paymentID = match[1];

                  // Lấy thông tin paymentInfo tương ứng paymentID
                  const paymentInfo = retrievePaymentInfoByPaymentID(playerPayments, paymentID);

                  if (!paymentInfo) {
                        console.log("No payment info found for paymentID:", paymentID);
                        return response.status(404).send("Payment info not found");
                  }

                  // Kiểm tra trạng thái thanh toán
                  if (paymentInfo.paymentStatus !== "PENDING") {
                        console.log("Payment status is not pending, skip");
                        return response.status(200).send("Payment already processed");
                  }

                  const email = paymentInfo.email;
                  const playerName = paymentInfo.name;

                  // So sánh thời gian thanh toán và hết hạn
                  const paymentTime = new Date().getTime();
                  const expireTime = paymentInfo.expireTime;

                  if (expireTime <= paymentTime) {
                        await setPlayerPaymentFailedStatus(email, paymentTime, "Quá hạn thanh toán. Vui lòng liên hệ để được hỗ trợ.");
                        await sendFailedPaymentEmail(email, playerName, "Quá hạn thời gian thanh toán. Vui lòng liên hệ để được hỗ trợ!");
                        return response.status(200).send("Payment expired");
                  }

                  // So sánh số tiền giao dịch với yêu cầu
                  const requiredAmount = PAYMENT_STATIC_INFO.PAYMENT_AMOUNT;
                  if (transaction.amount < requiredAmount) {
                        await setPlayerPaymentFailedStatus(email, paymentTime, "Giao dịch không đủ số tiền. Vui lòng liên hệ để được hỗ trợ.");
                        await sendFailedPaymentEmail(email, playerName, "Giao dịch không đủ số tiền. Vui lòng liên hệ để được hỗ trợ.");
                        return response.status(200).send("Insufficient payment amount");
                  }

                  // Nếu tất cả đều ok, cập nhật trạng thái thành công
                  await setPlayerPaymentPaidStatus(email, paymentTime);
                  await sendSuccessPaymentEmail(email, playerName);
                  await sendEmailWithText('mndkhanh@gmail.com', 'Cóc Cầm Cơ - Chú ý! Có giao dịch mới đến',
                        `Check tài khoản MB Bank xem tiền vào chưa, phòng trường hợp có đứa nó spam request tới checkPayment và pass được cái check casso key. ID giao dịch: ${paymentID}`);

                  response.status(200).send("Payment processed successfully");

            } catch (error) {
                  console.error(error);
                  response.status(500).send("Internal Server Error");
            }


      });
});


/**
 * This is used to fetch url of an end point web app from apps script, 
 * then manipulate data received from that api.
 * 
 */
async function checkPaymentViaAppsScriptWebApp() {
      const response = await fetch("https://script.google.com/macros/s/AKfycby298z4r_TXs2puYrKh8cBGrkVfruzXq5WuaMHS-e6tF8Itx1jROp3NbcVExKYEs8K_7A/exec")
      const data = await response.json();
      console.log(data);
      /* Sample data
            {
                  data: [
                              {
                                    'Mã GD': 9607509,
                                    'Mô tả': '78706985528-MAI NGUYEN DUY KHANH chuyen tien qua MoMo-CHUYEN TIEN-OQCH56930575-MOMO78706985528MOMO',
                                    'Giá trị': 2000,
                                    'Ngày diễn ra': '2025-02-10 02:55:00',
                                    'Số tài khoản': '0362718422'
                              },
                              {
                                    'Mã GD': 9607599,
                                    'Mô tả': '78708450204-MAI NGUYEN DUY KHANH chuyen tien qua MoMo-CHUYEN TIEN-OQCH56932336-MOMO78708450204MOMO',
                                    'Giá trị': 2000,
                                    'Ngày diễn ra': '2025-02-10 04:17:00',
                                    'Số tài khoản': '0362718422'
                              }
                        ],
                  error: false
            }
      */
}


export { checkPlayerPayment };
