$(document).ready(function () {
  $("#petTable").DataTable({
    responsive: true,
    pageLength: 6,
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
    columnDefs: [
      { width: "200px", targets: 9 } // Adjust width as needed
    ]
  });
});

function redirectToAddPage() {
  window.location.href = "/pets/add";
}

function deleteProduct(petID) {
  fetch(`/pets/delete/${petID}`, {
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