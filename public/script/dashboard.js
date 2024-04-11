$(document).ready(function () {
  $("#petTable").DataTable({
    pageLength: 6,
    pagingType: "full_numbers",
    columnDefs: [{ visible: false, targets: [2, 3] }],
    order: [[1, "asc"]],
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

function deleteProduct(petID) {
  fetch(`/delete/${petID}`, {
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

function redirectToAddPage() {
  window.location.href = "/add";
}
