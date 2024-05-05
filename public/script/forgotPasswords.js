const loader = document.getElementById("loader");

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
  window.location.href = "/account";
}

function showSuccessMessage(message) {
  Swal.fire({
    icon: 'success',
    title: 'Success!',
    confirmButtonColor: '#19a7ce',
    text: message
  }).then((result) => {
    if (result.isConfirmed || result.isDismissed) {
      redirectToSignInUp();
    }
  });
}

