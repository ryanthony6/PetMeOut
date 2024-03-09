const accordionContent = document.querySelectorAll(".accordion-content");
accordionContent.forEach((item, index) => {
  let header = item.querySelector("header");
  header.addEventListener("click", () => {
    item.classList.toggle("open");

    let description = item.querySelector(".description");
    if (item.classList.contains("open")) {
      description.style.height = `${description.scrollHeight}px`;
      item.querySelector("i").classList.replace("fa-plus", "fa-minus");
    } else {
      description.style.height = "0px";
      item.querySelector("i").classList.replace("fa-minus", "fa-plus");
    }
    removeOpen(index);
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
    document.querySelector(".active")?.classList.remove("active");
    navLinkFAQ.classList.add("active");
  });
});

const adoptionButton = document.getElementById("adoption-button");
const basicInfoButton = document.getElementById("basic-button");
const HowToHelpButton = document.getElementById("help-button");

const basicInfoContainer = document.querySelector(
  ".FAQ-container:nth-of-type(1)"
);
const adoptionContainer = document.querySelector(
  ".FAQ-container:nth-of-type(2)"
);
const HowToHelpContainer = document.querySelector(
  ".FAQ-container:nth-of-type(3)"
);

basicInfoContainer.style.display = "block";
adoptionContainer.style.display = "none";
HowToHelpContainer.style.display = "none";

basicInfoButton.addEventListener("click", function () {

  adoptionContainer.style.display = "none";
  basicInfoContainer.style.display = "block";
  HowToHelpContainer.style.display = "none";
});

adoptionButton.addEventListener("click", function () {
  basicInfoContainer.style.display = "none";
  adoptionContainer.style.display = "block";
  HowToHelpContainer.style.display = "none";
});

HowToHelpButton.addEventListener("click", function () {
  adoptionContainer.style.display = "none";
  basicInfoContainer.style.display = "none";
  HowToHelpContainer.style.display = "block";
});

