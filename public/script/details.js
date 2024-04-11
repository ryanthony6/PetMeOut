function img(anything) {
  document.querySelector('.slide').src = anything;
}

function change(change) {
  const line = document.querySelector('.home');
  line.style.background = change;
}

function closeForm() {
  document.getElementById("popup-form-container").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  function openForm() {
    document.getElementById("popup-form-container").style.display = "block";
  }

  const adoptButton = document.getElementById("btn-contact");
  adoptButton.addEventListener("click", () => {
    openForm();
  });

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

