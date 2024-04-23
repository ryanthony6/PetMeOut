function deleteUser(userID) {
    if (confirm("Are you sure you want to delete your account?")) {
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
          alert("Failed to delete account. Please try again.");
        });
    }
  }

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