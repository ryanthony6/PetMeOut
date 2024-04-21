document.getElementById("load-more-btn").addEventListener("click", function () {
  let skip = document.querySelectorAll(".blog-card").length; // Number of already loaded posts
  fetch(`/blog/load-more?skip=${skip}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        data.forEach((blog) => {
          // Append new blog card to the container
          // Adjust this part according to your HTML structure
          const blogContainer = document.querySelector(".blog-container");
          const blogCard = document.createElement("div");
          blogCard.classList.add("blog-card");
          blogCard.innerHTML = `
            <div class="blog-img">
              <img src="${blog.image}" alt="project" loading="lazy" class="project-img" />
            </div>
            <div class="blog-content">
              <a href="${blog.link}" target="_blank" class="blog-title">${blog.title}</a>
              <p>${blog.desc}</p>
              <div class="row">
                <span class="blog-author">${blog.author}</span>
                <span class="blog-category">${blog.category}</span>
              </div>
            </div>`;
          blogContainer.appendChild(blogCard);
        });
      } else {
        // If no more data, hide the "Load More" button
        document.getElementById("load-more-btn").style.display = "none";
      }
    })
    .catch((error) => console.error("Error fetching more blog data:", error));
});
