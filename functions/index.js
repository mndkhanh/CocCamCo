const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");
admin.initializeApp();

exports.randomNumber = functions.https.onCall((data, context) => {
      return `hello you there`;
}) 