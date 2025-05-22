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

let resultContainer = document.querySelector(".user-details");

if (searchForm) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const searchEmail = searchInput ? searchInput.value.trim() : "";
    if (!searchEmail) {
      setDefaultUserDetails();
      return;
    }

    const docRef = doc(db, "paymentInfo", searchEmail);
    onSnapshot(docRef, (doc) => {
      let userData = null;
      if (doc.exists()) {
        userData = { ...doc.data(), id: doc.id };
        displayUserData(userData);
      } else {
        resultContainer.innerHTML = `<p class="no-info">Không tìm thấy dữ liệu cho email này.</p>`;
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
      case 'FAILED':
        return 'Lỗi. Vui lòng liên hệ để được hỗ trợ!';
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
      copyAccountBtn.addEventListener('click', function () {
        const accountNumber = document.querySelector('.account-number').textContent;
        copyToClipboard(accountNumber, 'Đã sao chép số tài khoản');
      });
    }

    const copyPaymentBtn = document.getElementById('copy-payment');
    if (copyPaymentBtn) {
      copyPaymentBtn.addEventListener('click', function () {
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

//Chuyển mục thông tin
document.querySelectorAll('.player-info, .view-matches').forEach(e => {
  e.addEventListener('click', function() {
    const panelContent = document.querySelector('.panel-content');
    if (this.classList.contains('player-info')) {
      panelContent.innerHTML = `<div class="user-icon">
          <img src="assets/image/person.png" alt="Icon Person">
        </div>
        <div class="user-details">
          <p class="user-details-text">Vui lòng nhập email để tìm kiếm</p>
        </div>`;
    } else {
     panelContent.innerHTML = `<div class="match-container">
            <h3
              style="
                text-align: center;
                color: white;
                margin: 0;
                font-size: 3rem;
              "
            >
              VÒNG 32
            </h3>

            <div class="match-score">
              <div class="player">
                <img
                  src="assets/image/person.png"
                  alt="Player Icon"
                  class="player-icon"
                />
                <div class="player-name">Mai Nguyễn Duy Khánh</div>
                <div class="score winner">7</div>
              </div>

              <div class="score-divider">:</div>

              <div class="player">
                <img
                  src="assets/image/person.png"
                  alt="Player Icon"
                  class="player-icon"
                />
                <div class="player-name">Nguyễn Văn Tèo</div>
                <div class="score">2</div>
              </div>
            </div>

            <div class="match-details">
              <div class="match-detail-item">
                Cặp đấu số: <span class="highlight">31</span>
              </div>
              <div class="match-detail-item">
                Bàn số: <span class="highlight">12</span>
              </div>
              <div class="match-detail-item">
                Tình trạng vấn đấu: <span class="highlight">Đã đấu xong</span>
              </div>
              <div class="match-detail-item">
                Người chiến thắng:
                <span class="winner">Mai Nguyễn Duy Khánh</span>
              </div>
              <div class="match-detail-item">
                Comment: <span class="highlight">No Comment</span>
              </div>
            </div>

            <div style="text-align: center; margin-top: 30px">
              <button
                style="
                  background-color: #222;
                  border: 1px solid #e67f0d;
                  color: #e67f0d;
                  padding: 8px 16px;
                  border-radius: 8px;
                  cursor: pointer;
                "
              >
                Xem toàn bộ bảng đấu
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  style="vertical-align: middle; margin-left: 5px"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"
                  />
                </svg>
              </button>
            </div>
          </div>`;
    }
  })
})
