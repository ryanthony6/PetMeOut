// JavaScript
document.addEventListener("DOMContentLoaded", function () {
    fetch("/data.json")
      .then(response => response.json())
      .then(data => {
        displayPets(data);
      })
      .catch(error => console.error('Error fetching pets:', error));
  });
  
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
                <a href="/layout/details.html?id=${
                  index + 1
                }" class="readmore-btn" data-index="${index}">Read More</a>
            </div>
        `;
      cardContainer.appendChild(card);
    });
  }
  
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
  