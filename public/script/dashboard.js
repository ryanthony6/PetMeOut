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

function redirectToAddPage() {
  window.location.href = "/add";
}
