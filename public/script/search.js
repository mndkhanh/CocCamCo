import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  doc
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { TOURNAMENT_INFO } from "./tournament-info.js";

// Firebase config and initialization
const firebaseConfig = {
  apiKey: "AIzaSyD61Kw0yPaojDqln9WIeaQ-wO6zqLoyVGU",
  authDomain: "my-ccc-landing-page-gen2.firebaseapp.com",
  projectId: "my-ccc-landing-page-gen2",
  storageBucket: "my-ccc-landing-page-gen2.firebasestorage.app",
  messagingSenderId: "724723500756",
  appId: "1:724723500756:web:6557535fd76370e3b95d41",
  measurementId: "G-1NW1X74D7X",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore();

const searchForm = document.querySelector(".form-search");
const searchInput = searchForm ? searchForm.querySelector("input[name='email']") : null;
const resultContainer = document.querySelector(".user-details");

let unsubscribe = null;
let current_id = 0;
let matches = [];

const prevBtn = document.getElementById('prev-round');
const nextBtn = document.getElementById('next-round');

prevBtn.addEventListener('click', () => {
  if (current_id > 0) {
    current_id--;
    setRoundName();
    renderMatchesToUI();
  }
});

nextBtn.addEventListener('click', () => {
  if (current_id < 5) {
    current_id++;
    setRoundName();
    renderMatchesToUI();
  }
});

function setRoundName() {
  const roundNames = ['VÒNG 32', 'VÒNG 16', 'TỨ KẾT', 'BÁN KẾT', 'TRANH 3/4', 'CHUNG KẾT'];
  document.getElementById("round-name").textContent = roundNames[current_id] || 'VÒNG 32';
}

if (searchForm) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const searchEmail = searchInput ? searchInput.value.trim() : "";
    resultContainer.innerHTML = `<p class="user-details-text">Đang tìm kiếm...</p>`;
    if (!searchEmail) {
      if (unsubscribe) unsubscribe();
      setDefaultUserDetails();
      setDefaultUserMatch();
      return;
    }
    if (unsubscribe) unsubscribe();
    const docRef = doc(db, "paymentInfo", searchEmail);
    unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = { ...docSnap.data(), id: docSnap.id };
        displayUserData(userData);
        if (unsubcribeListenToMatchesCollection) unsubcribeListenToMatchesCollection();
        unsubcribeListenToMatchesCollection = listenToMatchesCollection(searchEmail, renderMatchesToUI);
      } else {
        resultContainer.innerHTML = `<p class="no-info">Không tìm thấy dữ liệu cho email này.</p>`;
        setDefaultUserMatch();
      }
    }, (error) => {
      resultContainer.innerHTML = `<p class="error">Lỗi: ${error.message}</p>`;
      setDefaultUserMatch();
    });
  });
}
setDefaultUserMatch();
setDefaultUserDetails();

async function listenToMatchesCollection(email, renderMatchesToUI) {
  const unsubscribeFns = [];
  const matchesRef = collection(db, "matches");
  const qRound = query(matchesRef, where("roundCode", "==", "R32"));
  const snapshot = await getDocs(qRound);

  let firstMatch = null;
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.email1 === email || data.email2 === email) {
      firstMatch = { id: docSnap.id, ...data };
    }
  });

  if (!firstMatch) {
    console.log("Không tìm thấy trận đầu tiên");
    matches = [];
    renderMatchesToUI();
    return () => { };
  }

  matches = new Array(6).fill(null);
  const idsToListen = new Array(6).fill(null);

  // Trận đầu tiên
  const startId = parseInt(firstMatch.id, 10);
  idsToListen[0] = startId.toString();

  // Các trận kế tiếp (chia đôi lấy nguyên)
  if (startId > 1) {
    let currentId = startId;
    for (let i = 1; i <= 3; i++) {
      currentId = Math.floor(currentId / 2);
      idsToListen[i] = currentId.toString();
      if (currentId <= 1) break;
    }
  }

  // Tranh 3/4 và Chung kết
  idsToListen[4] = "0";
  idsToListen[5] = "1";

  // Đăng ký lắng nghe theo từng ID
  idsToListen.forEach((id, idx) => {
    if (!id) return;
    const docRef = doc(db, "matches", id);
    const unsub = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        matches[idx] = { id: docSnap.id, ...docSnap.data() };
        renderMatchesToUI();
      }
    });
    unsubscribeFns.push(unsub);
  });

  return () => {
    unsubscribeFns.forEach(unsub => unsub());
  };
}


function setDefaultUserDetails() {
  if (resultContainer) {
    resultContainer.innerHTML = `<p class="user-details-text text-center">Vui lòng nhập email để tìm kiếm thông tin thí sinh và thông tin thanh toán!</p>`;
  }
}

function setDefaultUserMatch() {
  document.querySelectorAll(".player-name").forEach(el => el.textContent = "NO NAME");
  document.querySelectorAll(".score").forEach(el => el.textContent = "0");
  document.querySelector(".match-detail-item:nth-child(1) span").textContent = "NO CODE";
  document.querySelector(".match-detail-item:nth-child(2) span").textContent = "00";
  document.querySelector(".match-detail-item:nth-child(3) span").textContent = "NO TIME";
  document.querySelector(".match-detail-item:nth-child(4) span").textContent = "Đang chờ";
  document.querySelector(".match-detail-item:nth-child(5) span").textContent = "NO NAME";
  document.querySelector(".match-detail-item:nth-child(6) span").textContent = "NO COMMENT";
}

function renderMatchesToUI() {
  setRoundName();
  const match = matches[current_id];
  if (!match) {
    setDefaultUserMatch();
    return;
  }
  document.querySelectorAll(".player-name")[0].textContent = match.name1 || "NO NAME";
  document.querySelectorAll(".player-name")[1].textContent = match.name2 || "NO NAME";
  document.querySelectorAll(".score").forEach(el => el.textContent = "0");
  document.querySelector(".match-detail-item:nth-child(1) span").textContent = match.id || "NO CODE";
  document.querySelector(".match-detail-item:nth-child(2) span").textContent = match.tableCode || "00";
  document.querySelector(".match-detail-item:nth-child(3) span").textContent = match.startAt || "NO TIME";
  document.querySelector(".match-detail-item:nth-child(4) span").textContent = match.status || "Đang chờ";
  document.querySelector(".match-detail-item:nth-child(5) span").textContent = match.winnerName || "NO NAME";
  document.querySelector(".match-detail-item:nth-child(6) span").textContent = match.comment || "NO COMMENT";
}

function displayUserData(userData) {
  const getStatusClass = (status) => {
    if (!status) return '';
    switch (status.toUpperCase()) {
      case 'PAID': return 'Đã thanh toán';
      case 'PENDING': return 'Chưa thanh toán';
      case 'FAILED': return 'Lỗi. Vui lòng liên hệ để được hỗ trợ!';
      default: return '';
    }
  };

  // Gán nội dung tuỳ theo trạng thái
  switch (userData.paymentStatus) {
    case 'PENDING':
      resultContainer.innerHTML = `
        <div class="info-grid">
          <p class="email">Người chơi: ${userData.name || 'Chưa có dữ liệu'}</p>
          <p class="email">Email: ${userData.id}</p>
          <div class="payment-info-header" style="display: flex; align-items: center; gap: 8px;">
            <img src="assets/GG-icons/payment-icon.png" alt="payment-icon" style="width: 18px; height: 18px;" />
            <p style="margin: 0;">Tình trạng thanh toán</p>
          </div>
          <p class="status">Trạng thái: <span class="info-status">${getStatusClass(userData.paymentStatus)}</span></p>
          <p class="expire-time">Hết hạn thanh toán: ${formatTimestamp(userData.expireTime)}</p>
          <div class="qr-code-container">
            <img src="${userData.qrBanking}" alt="QR Code" class="qr-code-img" />
          </div>
          <p>Ngân hàng: MB Bank</p>
          <div style="display: inline-flex; align-items: center; gap: 8px;">
            <span>Số tài khoản:</span>
            <span class="account-number">0362718422</span>
            <img id="copy-account" class="copy-icon" src="assets/GG-icons/copy-icon.png" alt="copy-icon" />
          </div>
          <div class="copy-container">
            
          </div>
          <p>Chủ tài khoản: MAI NGUYEN DUY KHANH</p>
          <p>Lệ phí: ${TOURNAMENT_INFO.PAYMENT_AMOUNT} VNĐ</p>
          <div>Nội dung chuyển khoản:</div>
          <div style="display: inline-flex; align-items: center; gap: 8px; margin-top: 10px;">
            <span class="payment-id">COCCAMCO ${userData.paymentID}</span>
            <img id="copy-payment" class="copy-icon" src="assets/GG-icons/copy-icon.png" alt="copy-icon" />
          </div>
        </div>
      `;
      break;

    case 'FAILED':
      resultContainer.innerHTML = `
        <div class="info-grid">
          <p class="email">Người chơi: ${userData.name || 'Chưa có dữ liệu'}</p>
          <p class="email">Email: ${userData.id}</p>
          <div class="payment-info-header">
            <img src="assets/GG-icons/payment-icon.png" alt="payment-icon" />
            <p>Tình trạng thanh toán</p>
          </div>
          <p class="status">Trạng thái: <span class="info-status">${getStatusClass(userData.paymentStatus)}</span></p>
          <p class="expire-time">Hết hạn thanh toán: ${formatTimestamp(userData.expireTime)}</p>
        </div>
      `;
      break;

    case 'PAID':
      resultContainer.innerHTML = `
        <div class="info-grid">
          <p class="email">Người chơi: ${userData.name || 'Chưa có dữ liệu'}</p>
          <p class="email">Email: ${userData.id}</p>
          <div class="payment-info-header">
            <img src="assets/GG-icons/payment-icon.png" alt="payment-icon" />
            <p>Tình trạng thanh toán</p>
          </div>
          <p class="status">Trạng thái: <span class="info-status">${getStatusClass(userData.paymentStatus)}</span></p>
        </div>
      `;
      break;
  }

  // Gắn sự kiện sau khi DOM đã render xong
  setTimeout(() => {
    const copyAccountBtn = document.getElementById("copy-account");
    const copyPaymentBtn = document.getElementById("copy-payment");

    if (copyAccountBtn) {
      copyAccountBtn.addEventListener("click", () => {
        const accNumber = document.querySelector(".account-number")?.textContent.trim();
        if (accNumber) copyToClipboard(accNumber);
      });
    }

    if (copyPaymentBtn) {
      copyPaymentBtn.addEventListener("click", () => {
        const paymentText = document.querySelector(".payment-id")?.textContent.trim();
        if (paymentText) copyToClipboard(paymentText);
      });
    }
  }, 0); // đợi DOM cập nhật xong

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.style.visibility = "visible";
    toast.style.opacity = "1";
    toast.style.transition = "opacity 0.3s ease";

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.5s ease";
    }, 1000);

    setTimeout(() => {
      toast.style.visibility = "hidden";
    }, 1500);
  }

  function copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast("Đã sao chép!"))
      .catch((err) => {
        console.error("Lỗi sao chép:", err);
        showToast("Không thể sao chép!");
      });
  }
}


function formatTimestamp(timestamp) {
  if (!timestamp) return 'Không có';
  const date = new Date(parseInt(timestamp));
  return date.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

function copyToClipboard(text, message) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  alert(message);
}

let unsubcribeListenToMatchesCollection = null;

const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});
