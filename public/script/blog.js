document.getElementById("load-more-btn").addEventListener("click", async function () {
  let skip = document.querySelectorAll(".blog-card").length;
  try {
    const response = await fetch(`/blog/load-more?skip=${skip}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log(data);
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
              <span class="blog-category">${blog.blogCategory}</span>
            </div>
          </div>`;
        blogContainer.appendChild(blogCard);
      });
    } else {
      // If no more blogs, hide the "Load More" button
      document.getElementById("load-more-btn").style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching more blog data:", error);
    // Handle errors gracefully, such as displaying an error message to the user
  }
});


// Get reference to the category container
const categoryContainer = document.querySelector(".category-container");

// Add event listener for category click
categoryContainer.addEventListener("click", async function (event) {
  if (event.target.classList.contains("category")) {
    // Remove active class from all categories
    document.querySelectorAll(".category").forEach((category) => {
      category.classList.remove("active");
    });

    // Add active class to the clicked category
    event.target.classList.add("active");

    try {
      // Fetch blog posts for the selected category
      const selectedCategory = event.target.dataset.category;
      const response = await fetch(`/category?category=${selectedCategory}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      // Render blog posts
      renderBlogPosts(data.data);
    } catch (error) {
      console.error("Error fetching blog data:", error);
      // Handle errors gracefully, such as displaying an error message to the user
    }
  }
});

// Function to render blog posts
function renderBlogPosts(blogs) {
  const blogContainer = document.querySelector(".blog-container");
  blogContainer.innerHTML = "";

  if (blogs.length > 0) {
    blogs.forEach((blog) => {
      // Append new blog card to the container
      // Adjust this part according to your HTML structure
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
            <span class="blog-category">${blog.blogCategory}</span>
          </div>
        </div>`;
      blogContainer.appendChild(blogCard);
    });
  } else {
    // If no blogs found for selected category
    blogContainer.innerHTML = "<p>No blogs found for selected category.</p>";
  }
}
