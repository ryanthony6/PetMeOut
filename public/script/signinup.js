// Membuat panel bergeser pada bagian login / register
const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");

signUpButton.addEventListener("click", () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener("click", () => {
  container.classList.remove("right-panel-active");
});

// Tampilkan pesan error atau pesan sukses saat ada
const errorMessages = document.querySelectorAll(".error-message");
const successMessage = document.querySelector(".success-message");

errorMessages.forEach(message => {
  if (message.innerText !== "") {
    message.style.display = "block";
  }
});

if (successMessage.innerText !== "") {
  successMessage.style.display = "block";
}