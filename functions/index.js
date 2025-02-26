import { sendEmailWithVerCode } from "./emails/sendEmailWithVerCode.js";
import { sendRegisterForm } from "./register/register.js";

import { isEmailUsed, hasAvailSlot } from "./player-check/index.js";

import { checkPlayerPayment } from "./player-payment/checkPayment.js";




export { sendEmailWithVerCode, sendRegisterForm, isEmailUsed, hasAvailSlot, checkPlayerPayment };

