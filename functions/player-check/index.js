import { firestore } from "../firebase-admin.js";
import functions from "firebase-functions"

const playersRef = firestore.collection("players");

const isEmailUsed = functions.https.onCall(async (request) => {
      const email = request.data.email;
      if (!email) {
            throw new functions.https.HttpsError('invalid-argument', 'Email address is required.');
      }
      const docSnap = await playersRef.doc(email).get();
      return docSnap.exists;
});

const hasAvailSlot = functions.https.onCall(async (request) => {
      const querySnapShot = await playersRef.get();
      const currentNumOfSlots = querySnapShot.size;
      return 32 - currentNumOfSlots > 0;
});


export { isEmailUsed, hasAvailSlot }