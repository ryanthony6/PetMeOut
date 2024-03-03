document.addEventListener("DOMContentLoaded", function () {
  function openForm() {
    document.getElementById("popup-form-container").style.display = "block";
  }

  function closeForm() {
    document.getElementById("popup-form-container").style.display = "none";
  }

  document
    .querySelector(".btn-contact")
    .addEventListener("click", function (event) {
      event.preventDefault();
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

const accordionContent = document.querySelectorAll(".accordion-content");

accordionContent.forEach((item, index) => {
  let header = item.querySelector("header");
  header.addEventListener("click", () => {
    item.classList.toggle("open");

    let description = item.querySelector(".description");
    if (item.classList.contains("open")) {
      description.style.height = `${description.scrollHeight}px`; //scrollHeight property returns the height of an element including padding , but excluding borders, scrollbar or margin
      item.querySelector("i").classList.replace("fa-plus", "fa-minus");
    } else {
      description.style.height = "0px";
      item.querySelector("i").classList.replace("fa-minus", "fa-plus");
    }
    removeOpen(index); //calling the funtion and also passing the index number of the clicked header
  });
});


function removeOpen(index1) {
  accordionContent.forEach((item2, index2) => {
    if (index1 != index2) {
      item2.classList.remove("open");

      let des = item2.querySelector(".description");
      des.style.height = "0px";
      item2.querySelector("i").classList.replace("fa-minus", "fa-plus");
    }
  });
}

const navLinkFAQs = document.querySelectorAll(".nav_link");
navLinkFAQs.forEach((navLinkFAQ) => {
  navLinkFAQ.addEventListener("click", () => {
    document.querySelector('.active')?.classList.remove('active')
    navLinkFAQ.classList.add("active");
  });
});
