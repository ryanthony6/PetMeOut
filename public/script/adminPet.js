document.addEventListener("DOMContentLoaded", function () {
  var textarea = document.getElementById("description");
  maxLengthCheck(textarea);
});

// Fungsi untuk cek panjang karakter pada text area
function maxLengthCheck(object) {
  var charCount = object.value.length;
  if (charCount > object.maxLength)
    object.value = object.value.slice(0, object.maxLength);
  document.getElementById("charCount").innerHTML =
    charCount + "/" + object.maxLength;
}

// Fungsi untuk mengupload gambar
document.getElementById("stock-image").addEventListener("change", function () {
    var files = this.files;
    if (files.length > 3) {
      Swal.fire({
        title: "Error",
        text: "Please select up to 3 files.",
        icon: "error",
        confirmButtonText: 'Ok',
        confirmButtonColor: '#19a7ce', 
        
      }).then((value) => {
        if (value) {
          this.value = "";
        }
      });
    }
  });
  