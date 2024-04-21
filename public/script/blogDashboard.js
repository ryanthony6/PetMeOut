// menghapus blog
function deleteBlog(blogID) {
  fetch(`/blogs/deleteBlog/${blogID}`, {
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

function openForm() {
  document.getElementById("formContainer").style.display = "block";
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
