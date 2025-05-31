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
// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);

// Khởi tạo Firestore
const firestore = getFirestore(app);

// Reference đến collection "matches"
const matchesRef = collection(firestore, "matches");

let unsubscribe = null;
let matches = [];
let current_id = 7;


const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
prevBtn.addEventListener('click', () => {
    if (current_id > 0) {
        current_id--;
        renderUI();
    } else if (current_id == 0) {
        current_id = 7;
        renderUI();
    }
    console.log(current_id);

});

nextBtn.addEventListener('click', () => {
    if (current_id < 7) {
        current_id++;
        renderUI();
    } else if (current_id == 7) {
        current_id = 0;
        renderUI();
    }
    console.log(current_id);

});


document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        // Simulate prevBtn click
        if (current_id > 0) {
            current_id--;
        } else if (current_id === 0) {
            current_id = 7;
        }
        renderUI();
        console.log(current_id);
    } else if (e.key === 'ArrowRight') {
        // Simulate nextBtn click
        if (current_id < 7) {
            current_id++;
        } else if (current_id === 7) { // this condition is a logic bug, see note below
            current_id = 0;
        }
        renderUI();
        console.log(current_id);
    }
});





// Hàm bắt đầu lắng nghe realtime
function startListening() {
    unsubscribe = onSnapshot(matchesRef, (snapshot) => {
        matches = [];
        snapshot.forEach((doc) => {
            matches.push({ id: doc.id, ...doc.data() });
        });
        // Sắp xếp theo id tăng dần (giả sử id là kiểu string số hoặc số)
        matches.sort((a, b) => {
            // Nếu id là số:
            return Number(a.id) - Number(b.id);
            // Nếu id là string bình thường, dùng:
            // return a.id.localeCompare(b.id);
        });
        console.log("Realtime matches:", matches);
        renderUI();
    });
    console.log("🔥 Listener started");
}


// Hàm ngắt lắng nghe
function stopListening() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
        console.log("🛑 Listener stopped");
    }
}

// Tự động bắt đầu listener khi tab được focus
if (document.visibilityState === "visible") {
    startListening();
}

// Dừng hoặc tiếp tục listener khi thay đổi tab
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        startListening();
    } else {
        stopListening();
    }
});

function renderUI() {
    // phụ thuộc vào current_id và matches để render đúng
    for (let i = 0; i <= 31; i++) {
        stickMatchDataToEachDiv(document.getElementsByClassName(`id-${i}`), matches[i]);
    }

    // set toàn bộ panel-content về display none hết
    const panels = document.getElementsByClassName("panel-content");
    for (let panel of panels) {
        panel.classList.remove("active");
    }
    // xong rồi dựa trên current_id show cái phù hợp
    let round_id = "";
    const bgDiv = document.getElementById("bgDiv");
    switch (current_id) {
        case 0:
            round_id = "ALL";
            bgDiv.style.backgroundImage = "url('./assets/image/fire-small.jpg')";
            break;
        case 1:
            round_id = "R32_A";
            bgDiv.style.backgroundImage = "url('./assets/match-list-bg/R32_A.png')";
            break;
        case 2:
            round_id = "R32_B";
            bgDiv.style.backgroundImage = "url('./assets/match-list-bg/R32_B.png')";
            break;
        case 3:
            round_id = "R16_A";
            bgDiv.style.backgroundImage = "url('./assets/match-list-bg/R16_A.png')";
            break;
        case 4:
            round_id = "R16_B";
            bgDiv.style.backgroundImage = "url('./assets/match-list-bg/R16_B.png')";
            break;
        case 5:
            round_id = "R8";
            bgDiv.style.backgroundImage = "url('./assets/match-list-bg/R8.png')";
            break;
        case 6:
            round_id = "R4";
            bgDiv.style.backgroundImage = "url('./assets/match-list-bg/R4.png')";
            break;
        case 7:
            round_id = "R2_R3_4";
            bgDiv.style.backgroundImage = "url('./assets/match-list-bg/R2_R3_4.png')";
            break;


    }

    const currentPanel = document.getElementById(`round-${round_id}`);

    if (currentPanel) {
        currentPanel.classList.add("active");
    }
    set2ndPlayer();

}

function stickMatchDataToEachDiv(elems, data) {
    if (!data || !elems) return;

    for (let elem of elems) {
        const safeSet = (selector, value, fallback = "") => {
            if (value === null) return;
            const target = elem.querySelector(selector);
            if (target) target.textContent = value || fallback;
        };

        safeSet(".email1", data.email1, "NO PLAYER");
        safeSet(".email2", data.email2, "NO PLAYER");
        safeSet(".name1", data.name1, "NO PLAYER");
        safeSet(".name2", data.name2, "NO PLAYER");
        safeSet(".roundCode", data.roundCode, "");
        safeSet(".score1", data.score1, "0");
        safeSet(".score2", data.score2, "0");
        safeSet(".startAt", data.startAt, "NO TIME");
        safeSet(".endAt", data.endAt, "NO TIME");
        safeSet(".status", data.status);
        safeSet(".tableCode", data.tableCode, "00");
        safeSet(".winnerEmail", data.winnerEmail, "NO PLAYER");
        safeSet(".winnerName", data.winnerName, "NO PLAYER");
        safeSet(".comment", data.comment, "NO COMMENT");
        safeSet(".id", data.id, "");
    }
}

function generateUIRowForRoundAll() {
    document.getElementById("round-ALL").querySelectorAll(".ids").forEach((elem) => {
        elem.innerHTML = `
        <div
              class="relative border border-[#e67f0d] py-1 flex bg-[rgba(0,0,0,0.8)] rounded-md mb-4 w-full justify-between items-center mb-1"
            >
              <div
                class="absolute -top-1 left-2 px-2 font-bold bg-[#e67f0d] text-white rounded text-[8px] md:text-sm pointer-events-none"
              >
                #<span class="id font-bold">2</span>
              </div>
              <div
                class="font-semibold text-center text-[8px] md:text-base flex-1 text-white name1"
              >
                NO PLAYER
              </div>
              <div class="flex-1">
                <div
                  class="font-bold text-center text-[8px] md:text-sm text-[#e67f0d]"
                >
                  Bàn <span class="tableCode">00</span>
                </div>
                <div class="text-center text-[8px] md:text-sm text-white">
                  <span class="score1">0</span> - <span class="score2">0</span>
                </div>
                <div
                  class="text-center text-[8px] md:text-sm text-white startAt"
                >
                  NO TIME
                </div>
              </div>
              <div
                class="font-semibold text-center text-[8px] md:text-base flex-1 text-white name2"
              >
                NO PLAYER
              </div>
            </div>`
    })
}

function generateUIRowForRound32A() {
    document.getElementById("round-R32_A").querySelectorAll(".ids").forEach((elem) => {
        elem.innerHTML = `
        <div class="flex md:gap-3 gap-2 justify-between items-center mb-5">

            <!-- ID moved here -->
            <div class="text-white md:text-2xl text-sm font-black mr-2 text-xs pointer-events-none">
              # <span class="id"></span>    
            </div>

            <div
              class="name1 text-[8px] font-black text-center md:text-2xl flex-2 bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-bold md:px-4 py-1  md:py-4">
            </div>

            <div class="flex-1 flex flex-col text-center text-white leading-[1]">
  <div class="font-black text-cyan-400 text-[8px] md:text-sm">
    Bàn <span class="tableCode"></span>
  </div>
  <div class="text-[8px] md:text-sm">
    <span class="score1"></span> - <span class="score2"></span>
  </div>
  <div class="startAt text-[8px] md:text-sm"></div>
</div>


            <div
              class="name2 text-[8px] font-black text-center md:text-2xl flex-2 bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-bold md:px-4 py-1  md:py-4">
            </div>

          </div>`
    })
}

function generateUIRowForRound32B() {
    document.getElementById("round-R32_B").querySelectorAll(".ids").forEach((elem) => {
        elem.innerHTML = `
<div class="flex md:gap-3 gap-2 justify-between items-center mb-5">

            <div class="text-white md:text-2xl text-sm font-black mr-2 text-xs pointer-events-none">
              # <span class="id"></span>
            </div>

            <div
              class="name1 text-[8px] font-black text-center md:text-2xl flex-2 bg-gradient-to-r from-red-500 to-orange-400 text-white font-bold md:px-4 py-1 md:py-4">
            </div>

            <div class="flex-1 flex flex-col text-center text-white leading-[1]">
              <div class="font-black text-orange-500 text-[8px] md:text-sm">
                Bàn <span class="tableCode">00</span>
              </div>
              <div class="text-[8px] md:text-sm">
                <span class="score1">0</span> - <span class="score2">0</span>
              </div>
              <div class="startAt text-[8px] md:text-sm"></div>
            </div>

            <div
              class="name2 text-[8px] font-black text-center md:text-2xl flex-2 bg-gradient-to-r from-red-500 to-orange-400 text-white font-bold md:px-4 py-1 md:py-4">
            </div>
          </div>

        `
    })
}


function generateUIRowForRound16A() {
    document.getElementById("round-R16_A").querySelectorAll(".ids").forEach((elem) => {
        elem.innerHTML = `
<div class="flex md:gap-3 gap-2 justify-between items-center mb-5">

            <div class="text-white md:text-2xl text-sm font-black mr-2 text-xs pointer-events-none">
              # <span class="id"></span>
            </div>

            <div
              class="name1 text-[8px] font-black text-center md:text-2xl flex-2 bg-gradient-to-r from-cyan-700 to-lime-400 text-white font-bold md:px-4 py-1 md:py-4">
            </div>

            <div class="flex-1 flex flex-col text-center text-white leading-[1]">
              <div class="font-black text-lime-400  text-[8px] md:text-sm">
                Bàn <span class="tableCode">00</span>
              </div>
              <div class="text-[8px] md:text-sm">
                <span class="score1">0</span> - <span class="score2">0</span>
              </div>
              <div class="startAt text-[8px] md:text-sm"></div>
            </div>

            <div
              class="name2 text-[8px] font-black text-center md:text-2xl flex-2 bg-gradient-to-r from-cyan-700 to-lime-400 text-white font-bold md:px-4 py-1 md:py-4">
            </div>
          </div>

        `
    })
}

function generateUIRowForRound16B() {
    document.getElementById("round-R16_B").querySelectorAll(".ids").forEach((elem) => {
        elem.innerHTML = `
<div class="flex md:gap-3 gap-2 justify-between items-center mb-5">

            <div class="text-white md:text-2xl text-sm font-black mr-2 text-xs pointer-events-none">
              # <span class="id"></span>
            </div>

            <div
              class="name1 text-[8px] font-black text-center md:text-2xl flex-2 bg-gradient-to-r from-blue-700 to-yellow-400 text-white font-bold md:px-4 py-1 md:py-4">
            </div>

            <div class="flex-1 flex flex-col text-center text-white leading-[1]">
              <div class="font-black text-yellow-400  text-[8px] md:text-sm">
                Bàn <span class="tableCode">00</span>
              </div>
              <div class="text-[8px] md:text-sm">
                <span class="score1">0</span> - <span class="score2">0</span>
              </div>
              <div class="startAt text-[8px] md:text-sm"></div>
            </div>

            <div
              class="name2 text-[8px] font-black text-center md:text-2xl flex-2 bg-gradient-to-r from-blue-700 to-yellow-400 text-white font-bold md:px-4 py-1 md:py-4">
            </div>
          </div>

        `
    })
}


function generateUIRowForRound8() {
    document.getElementById("round-R8").querySelectorAll(".ids").forEach((elem) => {
        elem.innerHTML = `
<div class="flex md:gap-3 gap-2 justify-between items-center mb-5">

            <div class="text-white md:text-2xl text-sm font-black mr-2 text-xs pointer-events-none">
              # <span class="id"></span>
            </div>

            <div
              class="name1 text-[8px] font-black text-center md:text-2xl flex-2 bg-gradient-to-r from-blue-700 to-yellow-400 text-white font-bold md:px-4 py-1 md:py-4">
            </div>

            <div class="flex-1 flex flex-col text-center text-white leading-[1]">
              <div class="font-black text-yellow-400  text-[8px] md:text-sm">
                Bàn <span class="tableCode">00</span>
              </div>
              <div class="text-[8px] md:text-sm">
                <span class="score1">0</span> - <span class="score2">0</span>
              </div>
              <div class="startAt text-[8px] md:text-sm"></div>
            </div>

            <div
              class="name2 text-[8px] font-black text-center md:text-2xl flex-2 bg-gradient-to-r from-blue-700 to-yellow-400 text-white font-bold md:px-4 py-1 md:py-4">
            </div>
          </div>

        `
    })
}


function generateUIRowForRound4() {
    document.getElementById("round-R4").querySelectorAll(".ids").forEach((elem) => {
        elem.innerHTML = `
<div class="flex md:gap-3 gap-2 justify-between items-center mb-5">

            <div class="text-white md:text-2xl text-sm font-black mr-2 text-xs pointer-events-none">
              # <span class="id"></span>
            </div>

            <div
              class="name1 text-[8px] font-black text-center md:text-2xl flex-2 bg-gradient-to-r from-blue-700 to-yellow-400 text-white font-bold md:px-4 py-1 md:py-4">
            </div>

            <div class="flex-1 flex flex-col text-center text-white leading-[1]">
              <div class="font-black text-yellow-400  text-[8px] md:text-sm">
                Bàn <span class="tableCode">00</span>
              </div>
              <div class="text-[8px] md:text-sm">
                <span class="score1">0</span> - <span class="score2">0</span>
              </div>
              <div class="startAt text-[8px] md:text-sm"></div>
            </div>

            <div
              class="name2 text-[8px] font-black text-center md:text-2xl flex-2 bg-gradient-to-r from-blue-700 to-yellow-400 text-white font-bold md:px-4 py-1 md:py-4">
            </div>
          </div>

        `
    })
}

function set2ndPlayer() {
    const match = matches[1]; // trận chung kết
    let playerName;

    if (match.winnerEmail !== match.email1 && match.winnerEmail !== match.email2) {
        // winnerEmail khác cả 2 người
        playerName = "NO PLAYER";
    } else {
        // lấy tên người không phải người thắng
        if (match.winnerEmail === match.email1) {
            playerName = match.name2;
        } else {
            playerName = match.name1;
        }
    }

    document.getElementById("id-2nd-player").innerHTML = playerName;
}


// Hiển thị round đầu tiên khi load
generateUIRowForRoundAll();
generateUIRowForRound32A();
generateUIRowForRound32B();
generateUIRowForRound16A();
generateUIRowForRound16B();
generateUIRowForRound8();
generateUIRowForRound4();

renderUI();