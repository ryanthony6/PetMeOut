// menghapus blog
function deleteBlog(blogID) {
  fetch(`/deleteBlog/${blogID}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error("Failed to delete product");
      }
    })
    .catch((error) => {
      alert("Failed to delete product. Please try again.");
    });
}

// Fungsi untuk memeriksa jumlah baris dalam tabel
function checkRowCount() {
  const rowCount = document.querySelectorAll("tbody tr").length;
  return rowCount;
}

function openForm() {
  // Memeriksa apakah jumlah baris sudah mencapai 3
  if (checkRowCount() < 3) {
    document.getElementById("formContainer").style.display = "block";
  } else {
    alert("Tidak dapat menambahkan lebih dari 3 data.");
  }
}

// menambah data
const addButton = document.getElementById("btnAddBlog");
addButton.addEventListener("click", () => {
  openForm();
});

// cancel
document
  .querySelector(".cancel-btn")
  .addEventListener("click", function (event) {
    event.preventDefault();
    closeForm();
  });

// toggle edit form
window.addEventListener("click", function (event) {
  var popup = document.getElementById("formContainer");
  if (event.target === popup) {
    closeForm();
  }
});

function closeForm() {
  document.getElementById("formContainer").style.display = "none";
}


