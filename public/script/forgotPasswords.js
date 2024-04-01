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

function redirectToSignInUp() {
  window.location.href = "/signinup";
}
