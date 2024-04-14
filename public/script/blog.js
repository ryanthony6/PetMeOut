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

// function openEditForm() {
//   document.getElementById("editFormContainer").style.display = "block";
// }

// // toggle edit form
// const editButton = document.getElementById("btnEditBlog");
// editButton.addEventListener("click", () => {
//   openEditForm();
// })

// window.addEventListener("click", function (event) {
//     var editpopup = document.getElementById("editFormContainer");
//     if (event.target === editpopup) {
//       closeEditForm();
//     }
//   });

//   function closeEditForm() {
//     document.getElementById("editFormContainer").style.display = "none";
//   }



// toggle edit form dan hanya 1 edit form yang terbuka


function toggleEditForm(title) {
    // Dapatkan data blog sesuai dengan judul
    // Misalnya, dengan menggunakan AJAX atau metode lainnya
  
    // Contoh pengambilan data dengan AJAX
    // Ganti URL dengan endpoint yang sesuai untuk mengambil data blog berdasarkan judul
    fetch('/getBlogByTitle?title=' + encodeURIComponent(title))
      .then(response => response.json())
      .then(data => {
        // Set nilai input pada formulir edit dengan data yang sesuai
        document.getElementById('editFormContainer' + title).querySelector('#title').value = data.title;
        document.getElementById('editFormContainer' + title).querySelector('#desc').value = data.desc;
        document.getElementById('editFormContainer' + title).querySelector('#link').value = data.link;
        
        // Tampilkan formulir edit
        document.getElementById('editFormContainer' + title).style.display = 'block';
      })
      .catch(error => console.error('Error fetching blog data:', error));
  }
