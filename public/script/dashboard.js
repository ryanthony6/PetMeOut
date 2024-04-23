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
  Swal.fire({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover this pet!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#19a7ce",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/pets/delete/${petID}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            Swal.fire(
              "Deleted!",
              "Your pet has been deleted.",
              "success"
            ).then(() => {
              window.location.reload();
            });
          } else {
            throw new Error("Failed to delete product");
          }
        })
        .catch((error) => {
          Swal.fire(
            "Error!",
            "Failed to delete product. Please try again.",
            "error"
          );
        });
    }
  });
}
