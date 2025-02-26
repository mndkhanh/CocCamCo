import admin from "firebase-admin";

// Khởi tạo Firebase Admin
admin.initializeApp();

const firestore = admin.firestore();

export { firestore }
