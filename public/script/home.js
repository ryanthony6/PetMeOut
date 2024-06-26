document.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault(); 
    searchPets();
  });
});

// Fungsi untuk melakukan pencarian hewan
async function searchPets() {
  const query = document.getElementById("searchInput").value;
  const category = document.getElementById("categorySelect").value;
  const sorting = document.getElementById("sortingSelect").value;

  const url = `/pet?query=${query}&category=${category}&sorting=${sorting}`;
  const response = await fetch(url);
  const data = await response.json();

  displaySearchResults(data.data);

  // Mengatur ulang URL di browser tanpa memuat ulang halaman
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set("query", query);
  newUrl.searchParams.set("category", category);
  newUrl.searchParams.set("sorting", sorting);
  window.history.pushState({}, '', newUrl);
}


// Fungsi untuk menampilkan data hewan
function displaySearchResults(pets) {
  const cardContainer = document.getElementById("cardContainer");
  cardContainer.innerHTML = "";

  if (pets.length > 0) {
    if (document.getElementById("sortingSelect").value === "asc") {
      pets.sort((a, b) => a.name.localeCompare(b.name));
    } else if (document.getElementById("sortingSelect").value === "desc") {
      pets.sort((a, b) => b.name.localeCompare(a.name));
    }

    pets.forEach((pet) => {
      const card = document.createElement("div");
      card.classList.add("cards");

      const img = document.createElement("img");
      img.src = pet.image;
      img.alt = pet.name;

      const info = document.createElement("div");
      info.classList.add("info");
      info.innerHTML = `
        <p>${pet.name}</p>
        <p>${pet.breed}</p>
        <a href="/pets/details/${pet._id}" class="readmore-btn">Read More</a>
      `;

      card.appendChild(img);
      card.appendChild(info);
      cardContainer.appendChild(card);
    });
  } else {
    cardContainer.innerHTML = "<p>No pets found.</p>";
  }
}

// Fungsi untuk menavigasi ke halaman pencarian
function scrollToSearch() {
  
  const search = document.querySelector(".searchSection");

  search.scrollIntoView({ behavior: "smooth" });
}
