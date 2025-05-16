import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  doc
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
const db = getFirestore();
const colRef = collection(db, "paymentInfo");


const searchForm = document.querySelector(".form-search");

const searchInput = searchForm ? searchForm.querySelector("input[name='email']") : null;

const resultContainer = document.querySelector(".user-details");

if (searchForm) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const searchEmail = searchInput ? searchInput.value.trim() : "";
    if (!searchEmail) {
      alert("Vui lòng nhập email để tìm kiếm.");
      return;
    }
    
    const docRef = doc(db, "paymentInfo", searchEmail);
    onSnapshot(docRef, (doc) => {
      let userData = null;
      if (doc.exists()) {
        userData = { ...doc.data(), id: doc.id };
        displayUserData(userData);
      } else {
        resultsContainer.innerHTML = `<p class="no-info">Không tìm thấy dữ liệu cho email này.</p>`;
      }
    });
  });
}


//Hàm đặt nội dung mặc định cho div class user-detail
function setDefaultUserDetails() {
  const userDetail = document.querySelector(".user-details");
  if (userDetail) {
    userDetail.innerHTML = `<p class="user-details-text">Vui lòng nhập email để tìm kiếm</p>`;
  }
}

setDefaultUserDetails();

function displayUserData(userData) {
  const getStatusClass = (status) => {
    if (!status) return '';
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'Đã thanh toán';
      case 'PENDING':
        return 'Chưa thanh toán';
      default:
        return '';
    }
  };

  resultContainer.innerHTML = `
      <div class="info-grid">
        <p class="email">Người chơi: ${userData.name || 'Chưa có dữ liệu'}</p>
        <p class="email">Email: ${userData.id}</p>
        <div class="payment-info-header">
          <img src="assets/GG-icons/payment-icon.png" alt="payment-icon">
          <p>Tình trạng thanh toán</p>
        </div>
        <p class="status">Trạng thái: <span class="info-status">${getStatusClass(userData.paymentStatus)}</span></p>
        <p class="expire-time">Hết hạn thanh toán: ${formatTimestamp(userData.expireTime)}</p>
        <div class="qr-code-container">
          <img src="${userData.qrBanking}" alt="QR Code" class="qr-code-img" />
        </div>
        <p>Ngân hàng: MB Bank</p>
        <p>Số tài khoản: <span class="account-number">0362718422</span><img id="copy-account" class="copy-icon" src="assets/GG-icons/copy-icon.png" alt="copy-icon"></p>
        <p>Chủ tài khoản: MAI NGUYEN DUY KHANH</p>
        <p>Lệ phí: 120.000 VNĐ</p>
        <p>Nội dung chuyển khoản: <span class="payment-id">COCCAMCO + ${userData.paymentID}<img id="copy-payment" class="copy-icon" src="assets/GG-icons/copy-icon.png" alt="copy-icon"></span></p>
      </div>
  `;
  
  setTimeout(() => {
    const copyAccountBtn = document.getElementById('copy-account');
    if (copyAccountBtn) {
      copyAccountBtn.addEventListener('click', function() {
        const accountNumber = document.querySelector('.account-number').textContent;
        copyToClipboard(accountNumber, 'Đã sao chép số tài khoản');
      });
    }
    
    const copyPaymentBtn = document.getElementById('copy-payment');
    if (copyPaymentBtn) {
      copyPaymentBtn.addEventListener('click', function() {
        const paymentContent = document.querySelector('.payment-id').textContent;
        copyToClipboard(paymentContent, 'Đã sao chép nội dung chuyển khoản');
      });
    }
  }, 100);
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

// Hàm sao chép văn bản vào clipboard
function copyToClipboard(text, message) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  
  tempInput.select();
  document.execCommand('copy');
  
  document.body.removeChild(tempInput);
  
  showToast(message);
}

// Hàm hiển thị thông báo toast
function showToast(message) {
  // Kiểm tra xem đã có toast nào chưa
  let toast = document.querySelector('.toast-notification');
  
  // Nếu chưa có, tạo mới
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
    
    // Thêm CSS cho toast
    const style = document.createElement('style');
    style.textContent = `
      .toast-notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      }
      
      .toast-notification.show {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}
