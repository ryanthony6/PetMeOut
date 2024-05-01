let currentCategory = ""; // Variabel untuk menyimpan kategori saat ini

// Event listener untuk form pencarian dan filtering
document.getElementById('searchForm').addEventListener('submit', async (event) => {
  event.preventDefault(); // Menghindari reload halaman

  const query = document.getElementById('searchInput').value;
  currentCategory = document.getElementById('categorySelect').value; // Simpan nilai kategori saat ini
  const sorting = document.getElementById('sortingSelect').value;

  // Kirim permintaan AJAX ke endpoint server
  const response = await fetch(`/pet?query=${query}&category=${currentCategory}&sorting=${sorting}`);
  const data = await response.json();

  // Bersihkan konten sebelum menampilkan hasil pencarian baru
  clearPets();

  // Tampilkan hasil pencarian di halaman
  displayPets(data);
});

// Fungsi untuk membersihkan konten sebelum menampilkan hasil pencarian baru
function clearPets() {
  const cardContainer = document.getElementById('cardContainer');
  cardContainer.innerHTML = ''; // Menghapus semua kartu yang sudah ada
}

// Fungsi untuk menampilkan hasil pencarian di halaman
function displayPets(data) {
  const cardContainer = document.getElementById('cardContainer');
  
  // Cek apakah 'data' adalah objek yang memiliki properti 'data'
  const pets = Array.isArray(data) ? data : data.data;

  // Tambahkan data baru ke dalam card container
  pets.forEach((pet) => {
    const card = document.createElement('div');
    card.classList.add('cards');
    card.innerHTML = `
      <img src="${pet.image}" alt="tes" loading="lazy"/>
      <div class="info">
        <p>${pet.name}</p>
        <p>${pet.breed}</p>
        <a href="/pets/details/${pet.name}" class="readmore-btn">Read More</a>
      </div>
    `;
    cardContainer.appendChild(card);
  });
}
