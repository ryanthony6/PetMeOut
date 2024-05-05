const errorMessages = document.querySelectorAll(".error-message");
const successMessage = document.querySelector(".success-message");

errorMessages.forEach(message => {
if (message.innerText !== "") {
    message.style.display = "block";
  }
});

if (successMessage.innerText !== "") {
  showSuccessMessage(successMessage.innerText);
}

function redirectToSignInUp() {
  window.location.href = "/account";
}

// Fungsi menampilkan pesan sukses
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

