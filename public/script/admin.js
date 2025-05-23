import { app } from "./firebase-config.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, setDoc, deleteDoc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Initialize Firebase
const firestore = getFirestore(app);
const auth = getAuth(app);
// -----------------------------------------------

// DOM-related event
function setSignInWindow() {
      document.querySelector(".sign-in-form-wrapper").classList.add("active");
}

function unsetSignInWindow() {
      document.querySelector(".sign-in-form-wrapper").classList.remove("active");
}
// -----------------------------------------------

let players = [];
let payments = [];
let matches = [];

let unsubscribeListenToPlayersCollection = null;
let unsubscribeListenToPaymentInfoCollection = null;
let unsubcribeListenToMatchesCollection = null;

// firestore related functions
function listenToPlayersCollection() {
      return onSnapshot(collection(firestore, "players"), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                  if (change.type === "added") {
                        console.log("New player:", change.doc.id, change.doc.data());
                  }
                  if (change.type === "modified") {
                        console.log("Modified player:", change.doc.id, change.doc.data());
                  }
                  if (change.type === "removed") {
                        console.log("Removed player:", change.doc.id);
                  }
            });

            players = [];

            snapshot.forEach((doc) => {
                  players.push({ id: doc.id, ...doc.data() });
            });

            players.sort((playerA, playerB) => { return playerA.registerTime - playerB.registerTime });

            renderPlayersAndPaymentStatusToUI();

            console.log("Real-time update collection players:", players);
      });
}

function listenToMatchesCollection() {
      return onSnapshot(collection(firestore, "matches"), (snapshot) => {
            matches = [];

            snapshot.forEach((doc) => {
                  matches.push({ id: doc.id, ...doc.data() });
            });

            matches.sort((matchA, matchB) => { return matchA.id - matchB.id });

            renderMatchesToUI();

            console.log("Real-time update collection matches:", matches);
      });
}


function listenToPaymentInfoCollection() {
      return onSnapshot(collection(firestore, "paymentInfo"), (snapshot) => {

            snapshot.docChanges().forEach((change) => {
                  if (change.type === "added") {
                        console.log("New payment generated:", change.doc.id, change.doc.data());
                  }
                  if (change.type === "modified") {
                        console.log("Modified payment:", change.doc.id, change.doc.data());
                  }
                  if (change.type === "removed") {
                        console.log("Removed payment:", change.doc.id);
                  }
            });


            payments = [];

            snapshot.forEach((doc) => {
                  payments.push({ id: doc.id, ...doc.data() });
            });
            renderPlayersAndPaymentStatusToUI();
            console.log("Real-time update collection PaymentInfo:", payments);
      });
}

//open table
document.getElementById("openPlayerEdit").addEventListener("click", (e) => {
      document.getElementById("match-edit-table").classList.remove("active");
      document.getElementById("player-edit-table").classList.add("active");
})

document.getElementById("openMatchEdit").addEventListener("click", (e) => {
      document.getElementById("player-edit-table").classList.remove("active");
      document.getElementById("match-edit-table").classList.add("active");
})


// render players & payments array to ui
function renderPlayersAndPaymentStatusToUI() {
      const dashboardBody = document.querySelector("#player-edit-table .dashboard-body");
      dashboardBody.innerHTML = ""; // set to empty whenever rendering new list of data
      if (payments.length == 0 || players.length == 0) {
            return;
      }

      let rollNumber = 1;
      players.forEach((player) => {
            const email = player.email;
            const name = player.name;
            const age = player.age;
            const phoneNumber = player.phoneNumber;
            const registerTime = new Date(player.registerTime);
            const paymentStatus = getPaymentStatus(email);
            const playerRow = getPlayerRowDomElem(rollNumber, email, name, age, phoneNumber, registerTime, paymentStatus);
            dashboardBody.appendChild(playerRow);

            rollNumber++;
      });
}

//render matches edit
// const chia vong loai
function renderMatchesToUI() {
      const dashboardBody = document.querySelector("#match-edit-table .dashboard-body");
      dashboardBody.innerHTML = ""; // Clear existing content

      const searchValue = document.querySelector("#inpSearchName").value.trim().toLowerCase();
      if (!matches || matches.length === 0) return;

      const selectRoundFilter = document.querySelector("#select-round-filter").value;
      const filterMatch = matches.filter((item) => {
            const isRoundMatch = selectRoundFilter === "ALL" || item.roundCode === selectRoundFilter;
            const isNameMatch =
                  searchValue === "" ||
                  item.name1.toLowerCase().includes(searchValue) ||
                  item.name2.toLowerCase().includes(searchValue);
            return isRoundMatch && isNameMatch;
      });

      console.log("filterMatch here: ", filterMatch);

      for (const match of filterMatch) {
            const { id, email1, email2, name1, name2, score1, score2, winnerEmail, status, comment, startAt, endAt, tableCode, roundCode } = match;
            const matchRow = getMatchRowDomElem(id, email1, email2, name1, name2, score1, score2, winnerEmail, status, comment, startAt, endAt, tableCode, roundCode);
            dashboardBody.appendChild(matchRow);
      }

      stickEventsToEmailInp();
      adoptMatchStatusEffect();
      stickEventsToMatchStatus();
      assignEventsToSaveBtn();
      // Move checkTheFullEditScreen here to ensure the elements are processed immediately
      checkTheFullEditScreen();
}





function getMatchRowDomElem(id, email1, email2, name1, name2, score1, score2, winnerEmail, status, comment, startAt, endAt, tableCode, roundCode) {
      const matchRowElem = document.createElement("div");
      matchRowElem.classList.add("dashboard-row");
      let statusClass;
      switch (status) {
            case "WAITING":
                  statusClass = "waiting-match-status"
                  break;
            case "INMATCH":
                  statusClass = "inmatch-match-status"
                  break;
            case "DONE":
                  statusClass = "done-match-status"
      }

      matchRowElem.innerHTML = `
            <div class="dashboard-row">
                  <div class="col-0 hidden-when-full-edit">${roundCode}</div>
                  <div class="match-id col-1">${id}</div>
                  <div class="col-2 hidden-when-full-edit">
                    <input type="text" class="table-code" placeholder="00" value="${tableCode}"/>
                  </div>
                  <div class="col-3">
                    <input class="email1 player-email hidden-when-full-edit" type="text" placeholder="NO PLAYER" value="${email1}">
                    <p class="name1">${name1}</p>
                  </div>
                  <div class="col-4">
                    <input
                      type="text"
                      class="score1 match-score"
                      placeholder="0" value="${score1}"
                    />:<input type="text" class="score2 match-score" placeholder="0" value="${score2}"/>
                  </div>
                  <div class="col-5">
                    <input class="email2 player-email hidden-when-full-edit" type="text" placeholder="NO PLAYER" value="${email2}">
                    <p class="name2">${name2}</p>
                  </div>
                  <div class="col-6">
                    <input type="text" class="match-time start-time hidden-when-full-edit " placeholder="NO TIME" value="${startAt}">
                    <div class="hidden-when-full-edit" style="margin: 0px;">-</div>
                    <input type="text" class="match-time end-time hidden-when-full-edit endAtElem" placeholder="NO TIME" value="${endAt}">
                    <div class="match-status-toggle ${statusClass}">${status}</div>

                  </div>
                  <div class="col-7">
                    <select id="select-of-row-${id}">
                      <option value="NO PLAYER">-- choose winner--</option>
                      <option value="${email1}">
                        ${name1}
                      </option>
                      <option value="${email2}">
                        ${name2}
                      </option>
                    </select>
                  </div>
                  <div class="col-8">
                    <input type="text" class="match-comment" placeholder="NO COMMENT" value="${comment}"/>
                  </div>
                  <div class="col-9">
                    <button class="btnSaveMatch">
                      <img width=24px src="./assets/GG-icons/save-icon.png" alt="" />
                    </button>
                  </div>
            </div>
            `;
      const selectedElm = matchRowElem.querySelector(`#select-of-row-${id} option[value="${winnerEmail}"]`);
      if (selectedElm) {
            selectedElm.selected = true
      } else {
            matchRowElem.querySelector(`#select-of-row-${id} option[value="NO PLAYER"]`).selected = true
      }
      return matchRowElem;

}

function getPlayerRowDomElem(rollNumber, email, name, age, phoneNumber, registerTime, paymentStatus) {
      const playerRowElem = document.createElement("div");
      playerRowElem.classList.add("dashboard-row");
      playerRowElem.innerHTML = `
              <div class="col-1">${rollNumber}</div>
              <div class="col-2">${email}</div>
              <div class="col-3">${name}</div>
              <div class="col-4">${age}</div>
              <div class="col-5">${phoneNumber}</div>
              <div class="col-6">${formatDate(registerTime)}</div>
              <div class="col-7">
                <div class="btn-wrapper">
                  <div class="btnPlayerEdit"><img width="30px" height="30px" src="./assets/image/edit.png" alt="Edit"></div>
                </div>
              </div>
              <div class="col-8">
                <div class="btn-wrapper">
                  <div class="btnPaymentEdit btnPaymentStatus ${getPaymentStatusClass(paymentStatus)}"><img width="30px" height="30px"
                      src="./assets/GG-icons/payment-black-icon.png" alt="PaymentStatus">
                  </div>
                </div>
              </div>
      `;
      return playerRowElem;
}

function formatDate(timestamp) {
      const date = new Date(timestamp);

      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const year = date.getFullYear();

      const weekday = date.toLocaleString("vi-VN", { weekday: "long" }); // Vietnamese day name

      return `${hours}:${minutes}:${seconds} ${weekday} ${day}/${month}/${year}`;
}

function getPaymentStatusClass(paymentStatus) {
      let className = "";
      switch (paymentStatus) {
            case "PENDING":
                  className = "payment-pending-status";
                  break;
            case "PAID":
                  className = "payment-paid-status";
                  break;
            case "FAILED":
                  className = "payment-failed-status"
                  break;
      }
      return className;
}

function getPaymentStatus(email) {
      if (payments.length == 0) {
            console.log("No data in collection paymentInfo");
            return null;
      }

      for (let payment of payments) {
            if (payment.email === email) return payment.paymentStatus;
      }
      return null;
}

// -----------------------------------------------



// Function to Log in User
const loginUser = async (email, password) => {
      try {
            await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
            console.error("Error logging in:", error.message);
      }
};

const logoutUser = async () => {
      try {
            await signOut(auth);
      } catch (error) {
            console.error("Error logging out:", error.message);
      }
};

auth.onAuthStateChanged((user) => {
      if (user) { //user is in logging in mode
            console.log(user);
            unsetSignInWindow(); // close the sign in window

            // set the data array to players & payments above
            unsubscribeListenToPaymentInfoCollection = listenToPaymentInfoCollection();
            unsubscribeListenToPlayersCollection = listenToPlayersCollection();
            unsubcribeListenToMatchesCollection = listenToMatchesCollection();

      } else { // user logged out
            console.log("User logged out");
            setSignInWindow();

            // ✅ Fix: Check if unsubscribe functions exist before calling
            if (unsubscribeListenToPaymentInfoCollection) {
                  unsubscribeListenToPaymentInfoCollection();
                  unsubscribeListenToPaymentInfoCollection = null;
                  console.log("unsubcribe to paymentInfo")
            }

            if (unsubscribeListenToPlayersCollection) {
                  unsubscribeListenToPlayersCollection();
                  unsubscribeListenToPlayersCollection = null;
                  console.log("unsubcribe to players")
            }

            if (unsubcribeListenToMatchesCollection) {
                  unsubcribeListenToMatchesCollection();
                  unsubcribeListenToMatchesCollection = null;
                  console.log("unsubcribe to matches");
            }

      }
})
// -----------------------------------------------



// DOM event logic for button and so on
document.querySelector("#btnLogin").addEventListener("click", async () => {
      const email = document.querySelector("#emailTxt").value;
      const password = document.querySelector("#passwordTxt").value;
      console.log(email, password);
      await loginUser(email, password);
});

document.querySelector("#btnLogout").addEventListener("click", async () => {
      await logoutUser();
})

document.addEventListener("click", async (e) => {
      if (e.target.closest(".btnPlayerEdit")) { // Make sure it's the edit button
            e.preventDefault();

            // Get the closest dashboard-row element
            const playerRowElem = e.target.closest(".dashboard-row");

            if (!playerRowElem) return;

            // Get the email from the row
            const email = playerRowElem.querySelector(".col-2").textContent.trim();
            console.log("Editing player with email:", email);

            try {
                  await openPlayerDialogForEmail(email);
            } catch (err) {
                  console.error("Error fetching player data:", err);
            }
      }
});

async function openPlayerDialogForEmail(email) {
      const playerDoc = await getDoc(doc(firestore, "players", email));
      const player = playerDoc.data();

      if (!player) {
            console.log("No player found with this email.");
            return;
      }

      console.log("Editing player:", player);

      // Extract player details
      const { name, age, phoneNumber, registerTime } = player;

      // Populate the dialog form
      setDataForPlayerDialog(email, name, age, phoneNumber, registerTime);

      // Open the dialog
      document.querySelector("#playerEditDialog").showModal();
}


document.querySelector("#btnPlayerSaveEdit").addEventListener("click", async (e) => {
      e.preventDefault();

      // Ask the user for confirmation
      const confirmSave = confirm("Are you sure you want to save the changes?");

      if (!confirmSave) {
            console.log("User canceled the save.");
            return;
      }

      const email = document.querySelector("#inputPlayerEmail").value;
      const name = document.querySelector("#inputPlayerName").value;
      const age = Number(document.querySelector("#inputPlayerAge").value);
      const phoneNumber = document.querySelector("#inputPlayerPhoneNumber").value;
      const registerTime = Number(document.querySelector("#inputPlayerRegisterTime").value);



      try {
            // Update data in players collection
            const playerDoc = doc(firestore, "players", email);
            await updateDoc(playerDoc, {
                  email: email,
                  name: name,
                  age: age,
                  phoneNumber: phoneNumber,
                  registerTime: registerTime
            });

            // Update data in paymentInfo collection
            const paymentDoc = doc(firestore, "paymentInfo", email);
            await updateDoc(paymentDoc, {
                  name: name
            })

            console.log("Updating successfully");
      } catch (err) {
            console.error("Error when trying to edit email:", email);
            console.error(err);
      }

})

document.querySelector("#btnDeletePlayer").addEventListener("click", async (e) => {
      e.preventDefault();
      // Ask the user for confirmation
      const confirmSave = confirm("Are you sure you want to delete this player?");

      if (!confirmSave) {
            console.log("User not sure to delete player.");
            return;
      }

      const email = document.querySelector("#inputPlayerEmail").value;

      try {
            // Update data in players collection
            const playerDoc = doc(firestore, "players", email);
            await deleteDoc(playerDoc);

            // Update data in paymentInfo collection
            const paymentDoc = doc(firestore, "paymentInfo", email);
            await deleteDoc(paymentDoc);

            console.log("Deleted successfully");
            document.querySelector("#playerEditDialog").close();
      } catch (err) {
            console.error("Error when trying to delete player with email:", email);
            console.error(err);
      }

})


document.querySelector("#player-edit-table .dashboard-body").addEventListener("click", async (e) => {
      const btn = e.target.closest(".btnPaymentEdit");
      if (!btn) return; // Ignore clicks that are not on .btnPaymentEdit

      e.preventDefault();
      // Get the closest dashboard-row element
      const playerRowElem = btn.closest(".dashboard-row");
      if (!playerRowElem) return;

      // Get email & name from the row
      const email = playerRowElem.querySelector(".col-2").textContent.trim();
      const name = playerRowElem.querySelector(".col-3").textContent.trim();

      try {
            let paymentDoc = await getDoc(doc(firestore, "paymentInfo", email));
            let payment = paymentDoc.data();

            // If no payment exists, ask the user to create one
            if (!payment) {
                  let confirmNewPayment = confirm(`No payment found for ${email}. Create a new one?`);
                  if (!confirmNewPayment) return;

                  await generateNewPayment(email, name);
                  console.log(`New payment created for ${email}`);

                  // Fetch the newly created payment
                  paymentDoc = await getDoc(doc(firestore, "paymentInfo", email));
                  payment = paymentDoc.data();
            }

            // Open the payment edit dialog
            const paymentEditDialog = document.querySelector("#paymentEditDialog");
            paymentEditDialog.showModal();

            let isFirstInit = true;
            // ✅ Set up real-time listener for payment changes
            const unsubscribe = onSnapshot(doc(firestore, "paymentInfo", email), (snapshot) => {
                  if (!snapshot.exists()) {
                        console.log(`Payment record for ${email} was deleted.`);
                        return;
                  }

                  const paymentData = snapshot.data();
                  console.log("Live payment update:", paymentData);

                  const expireTime = paymentData.expireTime;
                  const generateTime = paymentData.generateTime;
                  const paymentTime = paymentData.paymentTime;
                  const paymentID = paymentData.paymentID;
                  const paymentStatus = paymentData.paymentStatus;
                  const qrBanking = paymentData.qrBanking;
                  const comment = paymentData.comment || "No comment";


                  // ✅ Skip alert on first snapshot
                  if (!isFirstInit) {
                        alert(`Payment info for ${email} has been updated!`);
                  }
                  isFirstInit = false;
                  // Set dialog fields with real-time data
                  setDataForPaymentDialog(email, name, generateTime, expireTime, paymentTime, paymentID, paymentStatus, qrBanking, comment);
            });

            // Close dialog and remove the listener
            paymentEditDialog.addEventListener("close", () => {
                  console.log("Unsubscribing from Firestore listener...");
                  unsubscribe();
            });

      } catch (err) {
            console.error("Error editing/creating payment:", err);
      }
});



async function generateNewPayment(email, name) {
      const paymentDoc = doc(firestore, "paymentInfo", email);
      const paymentID = generateUniqueIDPayment();
      await setDoc(paymentDoc, {
            email: email,
            name: name,
            generateTime: new Date().getTime(),
            expireTime: new Date().getTime() + 1000 * 60 * 60 * 24 * 2,
            paymentTime: 0,
            paymentStatus: "PENDING",
            paymentID: paymentID,
            qrBanking: getQRBankingURL(120000, paymentID),
            comment: ""
      });
      return;
}
function setDataForPaymentDialog(email, name, generateTime, expireTime, paymentTime, paymentID, paymentStatus, qrBanking, comment) {
      document.querySelector("#inputPaymentEmail").value = email;
      document.querySelector("#inputPaymentName").value = name;
      document.querySelector("#inputPaymentGenerateTime").value = generateTime;
      document.querySelector("#inputPaymentFormattedGenerateTime").value = formatDate(generateTime);
      document.querySelector("#inputPaymentExpireTime").value = expireTime;
      document.querySelector("#inputPaymentFormattedExpireTime").value = formatDate(expireTime);
      document.querySelector("#inputPaymentTime").value = paymentTime;
      document.querySelector("#inputPaymentFormattedPaymentTime").value = formatDate(paymentTime);
      document.querySelector("#imgQrBaking").setAttribute("src", qrBanking);
      document.querySelector("#inputPaymentID").value = paymentID;
      document.querySelector("#inputPaymentComment").value = comment;

      switch (paymentStatus) {
            case "PENDING":
                  selectStatusOption(pendingStatusElem);
                  break;
            case "FAILED":
                  selectStatusOption(failedStatusElem);
                  break;
            case "PAID":
                  selectStatusOption(paidStatusElem);
                  break;

      }
}

document.querySelector("#btnGenerateNewPaymentID").addEventListener("click", () => {
      const newPaymentID = generateUniqueIDPayment();
      document.querySelector("#inputPaymentID").value = newPaymentID;
      const amount = document.querySelector("#inputPaymentAmount").value;
      const newQRBankingURL = getQRBankingURL(amount, newPaymentID);
      document.querySelector("#imgQrBaking").setAttribute("src", newQRBankingURL);
});

document.querySelector("#inputPaymentAmount").addEventListener("change", () => {
      const paymentID = document.querySelector("#inputPaymentID").value;
      const amount = document.querySelector("#inputPaymentAmount").value;
      const newQRBankingURL = getQRBankingURL(amount, paymentID);
      document.querySelector("#imgQrBaking").setAttribute("src", newQRBankingURL);
})

function selectStatusOption(element) {
      // Remove 'selected' class from all options
      document.querySelectorAll('.btnPaymentStatus.status-option').forEach(option => option.classList.remove('selected'));

      // Add 'selected' class to clicked option
      element.classList.add('selected');

      // Update selected value
      document.querySelector("#status-value").innerHTML = element.getAttribute('data-payment-status');
}

document.querySelector("#btnPaymentSaveEdit").addEventListener("click", async (e) => {
      e.preventDefault();

      // Ask the user for confirmation
      const confirmSave = confirm("Are you sure you want to save the changes?");

      if (!confirmSave) {
            console.log("User canceled the save.");
            return;
      }

      const email = document.querySelector("#inputPaymentEmail").value;
      const name = document.querySelector("#inputPaymentName").value;
      const generateTime = Number(document.querySelector("#inputPaymentGenerateTime").value);
      const expireTime = Number(document.querySelector("#inputPaymentExpireTime").value);
      const paymentTime = Number(document.querySelector("#inputPaymentTime").value);
      const qrBanking = document.querySelector("#imgQrBaking").getAttribute("src");
      const paymentID = document.querySelector("#inputPaymentID").value;
      const paymentStatus = document.querySelector("#status-value").value;
      const comment = document.querySelector("#inputPaymentComment").value;


      try {
            // Update data in paymentInfo collection
            const paymentDoc = doc(firestore, "paymentInfo", email);
            await updateDoc(paymentDoc, {
                  email: email,
                  name: name,
                  generateTime: generateTime,
                  expireTime: expireTime,
                  paymentTime: paymentTime,
                  qrBanking: qrBanking,
                  paymentID: paymentID,
                  paymentStatus: paymentStatus,
                  comment: comment
            });

            console.log("Updating successfully");
      } catch (err) {
            console.error("Error when trying to edit payment for email:", email);
            console.error(err);
      }


})

document.querySelector("#btnDeletePayment").addEventListener("click", async (e) => {
      e.preventDefault();
      // Ask the user for confirmation
      const confirmSave = confirm("Are you sure you want to delete this player?");

      if (!confirmSave) {
            console.log("User not sure to delete player.");
            return;
      }

      const email = document.querySelector("#inputPaymentEmail").value;

      try {

            // Update data in paymentInfo collection
            const paymentDoc = doc(firestore, "paymentInfo", email);
            await deleteDoc(paymentDoc);

            console.log("Deleted successfully");
            document.querySelector("#paymentEditDialog").close();
      } catch (err) {
            console.error("Error when trying to delete player with email:", email);
            console.error(err);
      }

})

const pendingStatusElem = document.querySelector('.status-option.payment-pending-status');
const failedStatusElem = document.querySelector('.status-option.payment-failed-status');
const paidStatusElem = document.querySelector('.status-option.payment-paid-status');

document.querySelectorAll(".btnPaymentStatus.status-option").forEach(element => {
      element.addEventListener("click", () => { selectStatusOption(element) });
})

document.querySelector("#btnReactivcatePayment").addEventListener("click", () => {
      const inputPaymentGenerateTime = document.querySelector("#inputPaymentGenerateTime");
      const inputPaymentExpireTime = document.querySelector("#inputPaymentExpireTime");
      const inputPaymentTime = document.querySelector("#inputPaymentTime");

      inputPaymentGenerateTime.value = new Date().getTime();
      inputPaymentExpireTime.value = new Date().getTime() + 1000 * 60 * 60 * 24 * 2;
      inputPaymentTime.value = 0;
      selectStatusOption(pendingStatusElem);

      const generateTime = Number(document.querySelector("#inputPaymentGenerateTime").value);
      document.querySelector("#inputPaymentFormattedGenerateTime").value = formatDate(generateTime);

      const expireTime = Number(document.querySelector("#inputPaymentExpireTime").value);
      document.querySelector("#inputPaymentFormattedExpireTime").value = formatDate(expireTime);

      const paymentTime = Number(document.querySelector("#inputPaymentTime").value);
      document.querySelector("#inputPaymentFormattedPaymentTime").value = formatDate(paymentTime);
})

document.querySelector("#inputPaymentGenerateTime").addEventListener("change", (e) => {
      const generateTime = Number(document.querySelector("#inputPaymentGenerateTime").value);
      document.querySelector("#inputPaymentFormattedGenerateTime").value = formatDate(generateTime);
})

document.querySelector("#inputPaymentExpireTime").addEventListener("change", (e) => {
      const expireTime = Number(document.querySelector("#inputPaymentExpireTime").value);
      document.querySelector("#inputPaymentFormattedExpireTime").value = formatDate(expireTime);
})

document.querySelector("#inputPaymentTime").addEventListener("change", (e) => {
      const paymentTime = Number(document.querySelector("#inputPaymentTime").value);
      document.querySelector("#inputPaymentFormattedPaymentTime").value = formatDate(paymentTime);
})

function setDataForPlayerDialog(email, name, age, phoneNumber, registerTime) {
      document.querySelector("#inputPlayerEmail").value = email;
      document.querySelector("#inputPlayerName").value = name;
      document.querySelector("#inputPlayerAge").value = age;
      document.querySelector("#inputPlayerPhoneNumber").value = phoneNumber;
      document.querySelector("#inputPlayerRegisterTime").value = registerTime;
      document.querySelector("#inputPlayerFormattedTime").value = formatDate(registerTime);
}

document.querySelector("#inputPlayerRegisterTime").addEventListener("change", () => {
      const registerTime = Number(document.querySelector("#inputPlayerRegisterTime").value);
      document.querySelector("#inputPlayerFormattedTime").value = formatDate(registerTime);
})

document.querySelectorAll(".btnCloseDialog").forEach((button) => {
      button.addEventListener("click", () => {
            const playerEditDialog = document.querySelector("#playerEditDialog");
            const paymentEditDialog = document.querySelector("#paymentEditDialog");
            playerEditDialog.close();
            paymentEditDialog.close();
      })
})
// -----------------------------------------------


// Bank Related logic
function convertToURLString(input) {
      if (input === null || input === undefined) {
            return ""; // Return an empty string for null or undefined
      }

      // Convert input to string and trim whitespace
      const str = input.toString().trim();

      // Encode all special characters, including spaces as "%20"
      return encodeURIComponent(str);
}


function getBankingContent(paymentID) {
      return convertToURLString("COCCAMCO " + paymentID);
}

// endpoint api of VIETQR
function getQRBankingURL(amount, paymentID) {
      return `https://img.vietqr.io/image/970422-0362718422-print.png?amount=${amount}&addInfo=${getBankingContent(paymentID)}&accountName=MAI%20NGUYEN%20DUY%20KHANH&fbclid=IwZXh0bgNhZW0CMTEAAR15DQyb2vwaU9cG5tpWt7w31udUCeFOqogpxV834ela1qh2SN5Wb40US2Y_aem_I4MNYj-yqWkWEh79a73zwA`;
}
function generateUniqueIDPayment() {
      const timestampPart = new Date().getTime().toString().slice(-4); // Last 4 digits of the timestamp
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 random Base36 characters
      return timestampPart + randomPart;
}
// -----------------------------------------------


document.getElementById("see-full-edit-check").addEventListener("click", checkTheFullEditScreen);
function checkTheFullEditScreen() {
      const isChecked = document.getElementById("see-full-edit-check").checked;
      console.log(isChecked);
      document.querySelectorAll(".hidden-when-full-edit").forEach(elem =>
            elem.style.setProperty("display", isChecked ? "block" : "none", "important")
      );
}


function stickEventsToMatchStatus() {
      document.querySelectorAll(".match-status-toggle").forEach(button => {
            button.addEventListener("click", function () {
                  const endTimeBox = button.parentElement.querySelector(".endAtElem");
                  const date = new Date();
                  const formattedDate = date.toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit"
                  }).replace(",", "");

                  switch (button.textContent) {
                        case "WAITING":
                              button.textContent = "INMATCH";
                              button.className = "inmatch-match-status match-status-toggle";
                              endTimeBox.value = "NO TIME";
                              break;
                        case "INMATCH":
                              button.textContent = "DONE";
                              button.className = "done-match-status match-status-toggle";
                              endTimeBox.value = formattedDate;
                              break;
                        default:
                              button.textContent = "WAITING";
                              button.className = "waiting-match-status match-status-toggle";
                              endTimeBox.value = "NO TIME";
                              break;
                  }
            });
      });
}


async function stickEventsToEmailInp() {
      document.querySelectorAll(".email1, .email2").forEach((item) => {
            item.addEventListener("change", async () => {
                  const isEmail1 = item.classList.contains("email1");
                  const nameElem = item.parentElement.querySelector(isEmail1 ? ".name1" : ".name2");
                  const email = item.value.trim();
                  const option = item.parentElement.parentElement.querySelector(`.col-7 select option:nth-of-type(${isEmail1 ? 2 : 3})`);

                  if (email === "") {
                        item.value = "NO PLAYER";
                        nameElem.textContent = "NO PLAYER";
                        option.value = "NO PLAYER";
                        option.textContent = "NO PLAYER";
                        return;
                  }

                  const playerDoc = await getDoc(doc(firestore, "players", email));

                  if (playerDoc.exists()) {
                        const playerName = playerDoc.data().name;
                        nameElem.textContent = playerName;
                        option.value = email;
                        option.textContent = playerName;
                  } else {
                        nameElem.textContent = "NO PLAYER";
                        option.value = "NO PLAYER";
                        option.textContent = "NO PLAYER";
                  }
            });
      });
}

async function assignEventsToSaveBtn() {
      document.querySelectorAll(".btnSaveMatch").forEach(item => {
            item.addEventListener("click", async () => {
                  const dashboardRow = item.parentElement.parentElement;
                  const saveIcon = item.querySelector("img");

                  // Show loading effect
                  item.disabled = true;
                  const originalSrc = saveIcon.src;
                  saveIcon.src = "./assets/image/loading-icon.gif"; // Replace with your loading gif path

                  await saveMatchToFirestore(dashboardRow);

                  // Remove loading effect
                  item.disabled = false;
                  saveIcon.src = originalSrc;
            });
      });
}


async function saveMatchToFirestore(dashboardRow) {
      // Get values from the row
      const firstMatchID = dashboardRow.querySelector(".match-id").textContent;
      const winnerEmail = dashboardRow.querySelector("select").value;
      const winnerName = dashboardRow.querySelector("select").selectedOptions[0].textContent;
      const tableCode = dashboardRow.querySelector(".table-code").value;
      const comment = dashboardRow.querySelector(".match-comment").value;
      const email1 = dashboardRow.querySelector(".email1").value;
      const email2 = dashboardRow.querySelector(".email2").value;
      const name1 = dashboardRow.querySelector(".name1").textContent;
      const name2 = dashboardRow.querySelector(".name2").textContent;
      const score1 = dashboardRow.querySelector(".score1").value;
      const score2 = dashboardRow.querySelector(".score2").value;
      const startAt = dashboardRow.querySelector(".start-time").value;
      const endAt = dashboardRow.querySelector(".end-time").value;
      const status = dashboardRow.querySelector(".match-status-toggle").textContent;

      // Prepare the match info object
      const matchInfo = {
            winnerEmail,
            winnerName,
            tableCode,
            comment,
            email1,
            email2,
            name1,
            name2,
            score1,
            score2,
            startAt,
            endAt,
            status
      };

      // Save the match data to Firestore
      await setDoc(doc(firestore, "matches", String(firstMatchID)), matchInfo, { merge: true });

      if (winnerEmail === "NO PLAYER" || !winnerEmail || !winnerName || (winnerEmail !== email1 && winnerEmail !== email2)) {
            return;
      }

      // if that is the final round, finish
      if (firstMatchID == 1) {
            return;
      }
      const secondMatchID = firstMatchID % 2 == 0 ? firstMatchID / 2 : (firstMatchID - 1) / 2;
      const matchRefForWinner = doc(firestore, "matches", String(secondMatchID));
      if (firstMatchID % 2 == 0) {
            await setDoc(matchRefForWinner, {
                  email1: email1,
                  name1: name1
            }, { merge: true });
      } else {
            await setDoc(matchRefForWinner, {
                  email2: email2,
                  name2: name2
            }, { merge: true });
      }
}



function adoptMatchStatusEffect() {
      document.querySelectorAll(".match-status-toggle").forEach(button => {
            switch (button.textContent) {
                  case "WAITING":
                        button.className = "waiting-match-status match-status-toggle";
                        break;
                  case "INMATCH":
                        button.className = "inmatch-match-status match-status-toggle";
                        break;
                  case "DONE":
                        button.className = "done-match-status match-status-toggle";
                        break;
            }
      });
}


document.querySelector("#select-round-filter").addEventListener("change", () => {
      renderMatchesToUI();
})

document.querySelector("#inpSearchName").addEventListener("change", () => {
      const searchValue = document.querySelector("#inpSearchName").value;
      renderMatchesToUI();
})