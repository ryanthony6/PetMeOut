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
  window.location.href = "/add";
}
