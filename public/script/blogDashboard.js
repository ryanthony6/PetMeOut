$(document).ready(function () {
  $("#blogTable").DataTable({
    responsive: true,
    pageLength: 4,
    pagingType: "full_numbers",
    order: [[0, "asc"]],
    searching: true,
    language: {
      paginate: {
        first: "First",
        last: "Last",
        next: "Next",
        previous: "Previous",
      },
      emptyTable: "No data available in table",
    },
  });
});


// menghapus blog
function deleteBlog(blogID) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You will not be able to recover this blog!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/blogs/deleteBlog/${blogID}`, {
        method: "DELETE",
      })
      .then((response) => {
        if (response.ok) {
          Swal.fire(
            'Deleted!',
            'Your blog has been deleted.',
            'success'
          ).then(() => {
            window.location.reload();
          });
        } else {
          throw new Error("Failed to delete blog");
        }
      })
      .catch((error) => {
        Swal.fire(
          'Error!',
          'Failed to delete blog. Please try again.',
          'error'
        );
      });
    }
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
