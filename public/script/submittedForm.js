document.addEventListener("DOMContentLoaded", function() {
    // Mendapatkan semua elemen kartu
    var cards = document.querySelectorAll(".card");
  
    // Menambahkan event listener untuk setiap kartu
    cards.forEach(function(card) {
      card.addEventListener("click", function() {
        // Mengambil nama hewan peliharaan dari elemen kartu
        var petName = card.querySelector('.card-header h2').innerText.trim().replace(" Adoption", "");
        
        // Mengarahkan ke halaman pets/details dengan parameter name
        window.location.href = "/pets/details/" + encodeURIComponent(petName);
      });
    });
});