const successMessage = document.querySelector(".success-message");
const loader = document.getElementById("loader");

if (successMessage.innerText !== "") {
  showSuccessMessage(successMessage.innerText);
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
