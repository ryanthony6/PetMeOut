const form = document.querySelector('form');


form.addEventListener('submit', (event) => {
  const password = document.querySelector('input[name="password"]').value;
  const confirmNewPassword = document.querySelector('input[name="confirmNewPassword"]').value;

  const errorMessagePasswordMatch = document.querySelector('.error-password-match');
  
    errorMessagePasswordMatch.style.display = 'none';

  if (password !== confirmNewPassword) {
    event.preventDefault(); 
    errorMessagePasswordMatch.style.display = 'block';
  }
});

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
