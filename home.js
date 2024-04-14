// Mengambil data pada json
document.addEventListener("DOMContentLoaded", function () {
    fetch("/data.json")
      .then(response => response.json())
      .then(data => {
        displayPets(data);
      })
      .catch(error => console.error('Error fetching pets:', error));
  });
  
  // Menampilkan hewan-hewan sesuai json
  function displayPets(pets) {
    const cardContainer = document.getElementById("cardContainer");
    cardContainer.innerHTML = ""; // Clear previous content
  
    pets.forEach((pet, index) => {
      const card = document.createElement("div");
      card.className = "cards";
      card.innerHTML = `
            <img src="${pet.image}" />
            <div class="info">
                <p>${pet.name}</p>
                <p>${pet.petRace}</p>
                <a href="/details?id=${
                  index + 1
                }" class="readmore-btn" data-index="${index}">Read More</a>
            </div>
        `;
      cardContainer.appendChild(card);
    });
  }
  
  // Menyaring jenis hewan yang dicari
  function filterPets() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const categorySelect = document.getElementById('categorySelect').value.toLowerCase();
  
    fetch("/data.json")
      .then(response => response.json())
      .then(data => {
        let filteredPets = data.filter(pet =>
          (pet.name.toLowerCase().includes(searchInput) || pet.petRace.toLowerCase().includes(searchInput)) &&
          (categorySelect === '' || pet.category.toLowerCase() === categorySelect)
        );
        displayPets(filteredPets);
      })
      .catch(error => console.error('Error fetching and filtering pets:', error));
  }

const findPetButton = document.querySelector('.hero-btn');

findPetButton.addEventListener('click', () => {
    const searchSection = document.querySelector('.searchSection');
    searchSection.scrollIntoView({ behavior: 'smooth' });
});

// Ambil elemen profile icon
const profileIcon = document.getElementById('profileIcon');

// Tambahkan event listener untuk menanggapi klik pada profile icon
profileIcon.addEventListener('click', function() {
  // Tampilkan UI profile card yang bisa diedit
  showProfileCard();
});

// Fungsi untuk menampilkan UI profile card
function showProfileCard() {
  // Tambahkan kode untuk menampilkan UI profile card di sini
}

  