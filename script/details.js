const urlParams = new URLSearchParams(window.location.search);
const petId = urlParams.get('id');

fetch("/data.json")
    .then(response => response.json())
    .then(data => {
        const pet = data.find(pet => pet.id === petId);
        displayPetDetails(pet);
    })
    .catch(error => console.error('Error fetching pet details:', error));

function displayPetDetails(pet) {
    const detailContent = document.getElementById('detailContent');
    if (pet) {
        detailContent.innerHTML = `
            <div class="card">
                <div class="details">
                    <h2>Detail Hewan</h2>
                    <p><b>Nama:</b> ${pet.name}</p>
                    <p><b>Jenis:</b> ${pet.petRace}</p>
                    <!-- Tambahkan detail lain sesuai kebutuhan -->
                </div>
                <div class="image">
                    <img src="${pet.image}" alt="Gambar Hewan" />
                </div>
            </div>
        `;
    } else {
        detailContent.innerHTML = "<p>Hewan tidak ditemukan.</p>";
    }
}
