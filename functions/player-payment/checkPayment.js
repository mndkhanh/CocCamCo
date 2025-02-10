import functions from "firebase-functions";
import { firestore } from "../firebase-admin.js";
import { PAYMENT_STATIC_INFO } from "./payment-static-info.js";
import { sendFailedPaymentEmail, sendSuccessPaymentEmail } from "../emails/sendPaymentInform.js"
import cors from "cors";
import { QuerySnapshot } from "firebase-admin/firestore";
import { object } from "firebase-functions/v1/storage";
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


/**
 * This is a https trigger whenever be called, aims to 
 * check payment info and modify the payment status of clients.
 * 
*/
const checkPlayerPayment = functions.https.onRequest((request, response) => {
      corsHandler(request, response, async () => {
            //check data does exist or not
            const transactions = request.body.data;
            if (!transactions) {
                  console.error("transaction does not exist");
                  return;
            }
            /*Sample data received
                  [
                        {
                              id: 9607599,
                              tid: 'FT25041233908590',
                              description: 'COCCAMCO 12345A7BC0',
                              amount: 2000,
                              cusum_balance: 0,
                              when: '2025-02-10 04:17:00',
                              bank_sub_acc_id: '0362718422',
                              subAccId: '0362718422',
                              bankName: 'MBBank Official',
                              bankAbbreviation: 'MBB',
                              virtualAccount: '',
                              virtualAccountName: '',
                              corresponsiveName: '',
                              corresponsiveAccount: '2281072020614',
                              corresponsiveBankId: '970422',
                              corresponsiveBankName: ''
                        }
                  ]
            */
            try {
                  // get player Payment array from firestore
                  const playerPayments = await getDataCollectionFromPaymentInfo();

                  // traverse the array received from CASSO to get the paymentID from transaction banking
                  // then check the expireTime
                  // then check the amount
                  // if success, set playerPayment to PAID, otherwise: FAILED
                  for (const transaction of transactions) {
                        const description = transaction.description;
                        if (!description.includes("COCCAMCO")) continue; // if not having the "COCCAMCO" string in the content transaction, continue operacting the next transaction

                        // extract the paymentInfo in firestore
                        const paymentID = description.trim().split(" ")[1];
                        const paymentInfo = retrievePaymentInfoByPaymentID(playerPayments, paymentID);
                        if (!paymentInfo) {
                              continue;
                        }

                        //get the email
                        const email = paymentInfo.email;
                        const playerName = paymentInfo.name;

                        // get the paymentTime, expireTime and compare
                        const paymentTime = new Date(transaction.when.replace(" ", "T")).getTime();
                        const expireTime = paymentInfo.expireTime;
                        if (expireTime <= paymentTime) {
                              await setPlayerPaymentFailedStatus(email, paymentTime, "Quá hạn thanh toán. Vui lòng liên hệ để được hỗ trợ.");
                              await sendFailedPaymentEmail(email, playerName, "Quá hạn thời gian thanh toán. Vui lòng liên hệ để được hỗ trợ!");
                              continue;
                        }

                        // get the amount of the transaction, then comparing with PAYMENT_STATIC_INFO (amount)
                        const requiredAmount = PAYMENT_STATIC_INFO.PAYMENT_AMOUNT;
                        const transactionAmount = transaction.amount;
                        if (transactionAmount < requiredAmount) {
                              await setPlayerPaymentFailedStatus(email, paymentTime, "Giao dịch không đủ số tiền. Vui lòng liên hệ để được hỗ trợ.");
                              await sendFailedPaymentEmail(email, playerName, "Giao dịch không đủ số tiền. Vui lòng liên hệ để được hỗ trợ.");
                              continue;
                        }

                        // if pass all, set to PAID status
                        await setPlayerPaymentPaidStatus(email, paymentTime);

                        // send email successfully transaction
                        await sendSuccessPaymentEmail(email, playerName);
                  }


            } catch (error) {
                  console.error(error);
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
