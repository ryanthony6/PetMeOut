// Menghapus user dan menampilkan pesan dengan sweet alert
function deleteUser(userID) {
    Swal.fire({
      title: 'Are you sure want to delete this account?',
      text: 'You will not be able to recover this account!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete this account!',
      cancelButtonText: 'No, keep this account',
      reverseButtons: true,
      confirmButtonColor: '#dc3545', 
      cancelButtonColor: '#19a7ce' 
  
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/userprofile/deleteAccount/${userID}`, {
          method: "DELETE",
        })
        .then((response) => {
          if (response.ok) {
            window.location.href = "/";
          } else {
            throw new Error("Failed to delete account");
          }
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Gagal menghapus akun. Silakan coba lagi.'
          });
        });
      }
    });
  }
  
// Fungsi mengganti profile picture sesuai dengan gambar yang dipilih
  function previewProfilePicture(event) {
    var img = document.getElementById("current-profile-img");
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        img.src = e.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    } else {
    }
  }