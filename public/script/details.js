function closeForm() {
  document.getElementById("popup-form-container").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  function openForm() {
    document.getElementById("popup-form-container").style.display = "block";
  }

  function displayPetDetails(pet) {
    const detailContent = document.getElementById("detailContent");
    if (pet) {
      detailContent.innerHTML = `
              <div class="card">
                  <div class="details">
                      <h2>Detail Hewan</h2>
                      <p><b>Nama:</b> ${pet.name}</p>
                      <p><b>Umur:</b> ${pet.age}</p>
                      <p><b>Gender:</b> ${pet.sex}</p>
                      <p><b>Ukuran:</b> ${pet.size}</p>
                      <p><b>Jenis:</b> ${pet.petRace}</p>
                      <p><b>Lokasi:</b> ${pet.location}</p>
                      <button class="btn-contact" id="btn-contact"><b>Adopt pet</b></button>
                      <!-- Tambahkan detail lain sesuai kebutuhan -->
                  </div>
                  <div class="image">
                      <img src="${pet.image}" alt="Gambar Hewan" />
                  </div>
              </div>
          `;
      // Menambahkan event listener pada tombol "Adopt pet"
      const adoptButton = document.getElementById("btn-contact");
      adoptButton.addEventListener("click", () => {
        openForm();
      });
    } else {
      detailContent.innerHTML = "<p>Hewan tidak ditemukan.</p>";
    }
  }

  fetch("/data.json")
    .then((response) => response.json())
    .then((data) => {
      const urlParams = new URLSearchParams(window.location.search);
      const petId = urlParams.get("id");
      const pet = data.find((pet) => pet.id === petId);
      displayPetDetails(pet);
    })
    .catch((error) => console.error("Error fetching pet details:", error));

  document
    .querySelector(".close-btn")
    .addEventListener("click", function (event) {
      event.preventDefault();
      closeForm();
    });

  document
    .querySelector(".cancel-btn")
    .addEventListener("click", function (event) {
      event.preventDefault();
      closeForm();
    });

  window.addEventListener("click", function (event) {
    var popup = document.getElementById("popup-form-container");
    if (event.target === popup) {
      closeForm();
    }
  });
});
