// Fungsi accordion
document.addEventListener("DOMContentLoaded", function() {
  const accordionContent = document.querySelectorAll(".accordion-content");
  accordionContent.forEach((item, index) => {
    let header = item.querySelector("header");
    let iconPlusMinus = header.querySelector(".fa-plus"); // Tombol "+/-"

    // Tambahkan event listener untuk tombol "+/-"
    iconPlusMinus.addEventListener("click", () => {
      item.classList.toggle("open");

      let description = item.querySelector(".description");
      if (item.classList.contains("open")) {
        description.style.height = `${description.scrollHeight}px`;
        if (iconPlusMinus.classList.contains("fa-plus")) {
          iconPlusMinus.classList.replace("fa-plus", "fa-minus");
        } else {
          iconPlusMinus.classList.replace("fa-minus", "fa-plus");
        }
      } else {
        description.style.height = "0px";
        iconPlusMinus.classList.replace("fa-minus", "fa-plus");
      }
    });
  });
});

// Fungsi untuk menampilkan kategori
const navLinkFAQs = document.querySelectorAll(".nav_link");
navLinkFAQs.forEach((navLinkFAQ) => {
  navLinkFAQ.addEventListener("click", () => {
    navLinkFAQs.forEach((link) => {
      link.classList.remove("active");
    });

    navLinkFAQ.classList.add("active");

    const category = navLinkFAQ.textContent.trim().toLowerCase();
    const containers = document.querySelectorAll(".FAQ-container");

    containers.forEach((container) => {
      if (container.id === `${category}-container`) {
        container.style.display = "block";
      } else {
        container.style.display = "none";
      }
    });
  });
});

function editFaq(id) {
  window.location.href = `/faqs/editFaq/${id}`;
}

// Fungsi untuk menghapus FAQ
async function deleteFaq(faqID) {
  try {
    if (!faqID) {
      throw new Error("FAQ ID is null");
    }

    // Tampilkan konfirmasi menggunakan SweetAlert
    const confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this FAQ!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    // Jika pengguna menekan tombol "Yes, delete it!"
    if (confirmation.isConfirmed) {
      const response = await fetch(`/faqs/deleteFaq/${faqID}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh halaman setelah FAQ dihapus
        window.location.reload();
      } else {
        throw new Error("Failed to delete FAQ");
      }
    }
  } catch (error) {
    // Tangani kesalahan
    if (error instanceof TypeError || error instanceof SyntaxError) {
      // Tampilkan pesan kesalahan jika terjadi kesalahan
      alert("Failed to delete FAQ. Please try again.");
    } else {
      console.error(error);
    }
  }
}

function redirectToAddPage() {
  window.location.href = "/faqs/addfaq";
}
