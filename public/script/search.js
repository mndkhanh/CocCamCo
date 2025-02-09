import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
const firebaseConfig = {
      apiKey: "AIzaSyD61Kw0yPaojDqln9WIeaQ-wO6zqLoyVGU",
      authDomain: "my-ccc-landing-page-gen2.firebaseapp.com",
      projectId: "my-ccc-landing-page-gen2",
      storageBucket: "my-ccc-landing-page-gen2.firebasestorage.app",
      messagingSenderId: "724723500756",
      appId: "1:724723500756:web:6557535fd76370e3b95d41",
      measurementId: "G-1NW1X74D7X"
};
console.log("hello from search.js")
const app = initializeApp(firebaseConfig);
console.log("Firebase đã được khởi tạo:", app);
const db = getFirestore();
console.log("Firestore đã được khởi tạo");
const colRef = collection(db, "paymentInfo");
getDocs(colRef)
      .then((snapshot) => {
            let books = [];
            snapshot.docs.forEach((doc) => {
                  books.push({ ...doc.data(), id: doc.id });
            });
            console.log("Dữ liệu nhận được:", books);
      })
      .catch((err) => {
            console.error("Lỗi khi truy xuất dữ liệu:", err.message);
      });
