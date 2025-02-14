document.querySelector("#btnShowDialog").addEventListener("click", () => {
      document.querySelector("#dialog").showModal();
})

document.getElementById("btnSave").addEventListener("click", (e) => {
      e.preventDefault();
      const name = document.querySelector("#txtName").value;
      const password = document.querySelector("#txtPassword").value;
      document.querySelector("output").innerHTML = String(name) + password;

      document.getElementById("dialog").close();

})

document.getElementById("btnCancel").addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("dialog").close();
});