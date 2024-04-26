async function deleteForm(formId) {
  try {
    if (!formId) {
      throw new Error("Form ID is null");
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      const response = await fetch(`/userprofile/deleteForm/${formId}`, {
        method: "GET",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error("Failed to delete form");
      }
    }
  } catch (error) {
    if (error instanceof TypeError || error instanceof SyntaxError) {
      alert("Failed to delete form. Please try again.");
    } else {
      console.error(error);
    }
  }
}

function viewPetDetails(petName) {
  window.location.href = `/pets/details/${encodeURIComponent(petName)}`;
}
