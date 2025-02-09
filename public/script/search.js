import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyD61Kw0yPaojDqln9WIeaQ-wO6zqLoyVGU",
  authDomain: "my-ccc-landing-page-gen2.firebaseapp.com",
  projectId: "my-ccc-landing-page-gen2",
  storageBucket: "my-ccc-landing-page-gen2.firebasestorage.app",
  messagingSenderId: "724723500756",
  appId: "1:724723500756:web:6557535fd76370e3b95d41",
  measurementId: "G-1NW1X74D7X",
};

// Initialize Firebase
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

const searchForm = document.querySelector(".search");
const searchInput = searchForm.querySelector("input[name='email']");
const resultsContainer = document.createElement("div");
resultsContainer.classList.add("results");
document.querySelector(".container").appendChild(resultsContainer);

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const searchEmail = searchInput.value.trim();
  if (!searchEmail) {
    alert("Vui lòng nhập email để tìm kiếm.");
    return;
  }

  getDocs(colRef)
    .then((snapshot) => {
      let userData = null;
      snapshot.docs.forEach((doc) => {
        console.log("Checking document ID:", doc.id);
        console.log("Comparing with:", searchEmail);
        if (doc.id === searchEmail) {
          userData = { ...doc.data(), id: doc.id };
        }
      });

      if (userData) {
        displayUserData(userData);
      } else {
        resultsContainer.innerHTML = "<p>Không tìm thấy dữ liệu cho email này.</p>";
      }
    })
    .catch((err) => {
      console.error("Lỗi khi truy xuất dữ liệu:", err.message);
    });
});

function displayUserData(userData) {
  // Hàm để chuyển đổi trạng thái thành class tương ứng
  const getStatusClass = (status) => {
    if (!status) return '';
    switch (status.toUpperCase()) {
      case 'DONE':
        return 'success';
      case 'PENDING':
        return 'pending';
      default:
        return '';
    }
  };

  // Tạo URL thanh toán với mã thanh toán động
  const createPaymentUrl = (paymentId) => {
    const baseUrl = "https://img.vietqr.io/image/970422-0362718422-print.png";
    const amount = "120000";
    const accountName = "MAI%20NGUYEN%20DUY%20KHANH";
    // Thay thế mã thanh toán vào URL
    return `${baseUrl}?amount=${amount}&addInfo=COCCAMCO+${paymentId}&accountName=${accountName}`;
  };

  resultsContainer.innerHTML = `
    <div class="user-info">
      <h2>Thông tin thanh toán</h2>
      <div class="info-container">
        <div class="info-item">
          <strong>Email:</strong> 
          <span>${userData.id}</span>
        </div>
        <div class="info-item">
          <strong>Họ và tên:</strong>
          <span>${userData.fullname || 'Chưa cập nhật'}</span>
        </div>
        <div class="info-item">
          <strong>Mã thanh toán:</strong>
          <a href="${createPaymentUrl(userData.paymentID)}" 
             target="_blank" 
             class="payment-link">
             ${userData.paymentID || 'Nhấp để thanh toán'}
          </a>
        </div>
        <div class="info-item">
          <strong>Trạng thái:</strong>
          <span class="status ${getStatusClass(userData.paymentStatus)}">
            ${userData.paymentStatus || 'Chưa xác định'}
          </span>
        </div>
        <div class="info-item">
          <strong>Thời gian tạo:</strong>
          <span>${formatTimestamp(userData.generateTime)}</span>
        </div>
        <div class="info-item">
          <strong>Thời gian hết hạn:</strong>
          <span>${formatTimestamp(userData.expireTime)}</span>
        </div>
      </div>
      ${userData.qrRanking ? `
        <div class="qr-code">
          <p><strong>Mã QR:</strong></p>
          <img src="${userData.qrRanking}" alt="QR Code" />
        </div>
      ` : ''}
    </div>
  `;
}

// Hàm hỗ trợ format timestamp
function formatTimestamp(timestamp) {
  if (!timestamp) return 'Không có';
  const date = new Date(parseInt(timestamp));
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
