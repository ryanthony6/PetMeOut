// JavaScript code to handle category button clicks
document.querySelectorAll(".category").forEach((category) => {
  category.addEventListener("click", async () => {
    const categoryName = category.dataset.category;
    // Remove 'active' class from all categories
    document.querySelectorAll(".category").forEach((cat) => {
      cat.classList.remove("active");
    });
    // Add 'active' class to the clicked category
    category.classList.add("active");
    const response = await fetch(`/category?category=${categoryName}`);
    const data = await response.json();
    // Update DOM with blogs for the selected category
    updateBlogCards(data.blogs);
    // Show or hide load more button based on whether there are more blogs to load
    showHideLoadMoreButton(data.blogs);
  });
});

// JavaScript code to handle load more button click
document.getElementById("load-more-btn").addEventListener("click", async () => {
  const category = getCurrentCategory(); // Implement this function to get current category
  const skip = getCurrentBlogCount(); // Implement this function to get current blog count
  const response = await fetch(`/load-more?category=${category}&skip=${skip}`);
  const data = await response.json();
  // Update DOM with additional blogs
  appendBlogCards(data);
  // Show or hide load more button based on whether there are more blogs to load
  showHideLoadMoreButton(data);
});

// Function to update DOM with fetched blogs
function updateBlogCards(blogs) {
  // Clear existing blog cards
  clearBlogCards();

  // If there are no blogs available, show a message
  if (blogs.length === 0) {
    const container = document.querySelector(".blog-container");
    const message = document.createElement("p");
    message.textContent = "No blogs available.";
    container.appendChild(message);
    return;
  }
  // Append new blog cards
  appendBlogCards(blogs);
}

// Function to append blog cards to DOM
function appendBlogCards(blogs) {
  const container = document.querySelector(".blog-container");
  blogs.forEach((blog) => {
    // Create and append blog card elements
    const blogCard = createBlogCard(blog);
    container.appendChild(blogCard);
  });
}

// Function to create a blog card element
function createBlogCard(blog) {
  const blogLink = document.createElement("a");
  blogLink.href = blog.link;
  blogLink.target = "_blank";

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

  blogLink.appendChild(blogCard);
  return blogLink;
}

// Function to clear existing blog cards from DOM
function clearBlogCards() {
  const container = document.querySelector(".blog-container");
  container.innerHTML = ""; // Clear container
}

// Function to get the current category
function getCurrentCategory() {
  // Retrieve the active category
  const activeCategory = document.querySelector(".category.active");
  if (activeCategory) {
    return activeCategory.dataset.category;
  }
  return "All"; // Default to 'All' if no active category is found
}

// Function to get the current count of displayed blogs
function getCurrentBlogCount() {
  const container = document.querySelector(".blog-container");
  return container.children.length; // Count of currently displayed blog cards
}

// Function to show or hide load more button based on whether there are more blogs to load
function showHideLoadMoreButton(blogs) {
  const loadMoreButton = document.getElementById("load-more-btn");
  if (blogs.length < 6) {
    loadMoreButton.style.display = "none";
  } else{
    loadMoreButton.style.display = "inline-block";
  }
}

// Automatically fetch blogs and update DOM when the page loads
window.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch(`/category?category=All`);
  const data = await response.json();
  updateBlogCards(data.blogs);
  // Show or hide load more button based on whether there are more blogs to load
  showHideLoadMoreButton(data.blogs);
});

function scrollToArticle() {
  
  const article = document.querySelector(".blog");

  article.scrollIntoView({ behavior: "smooth" });
}

// Add click event listener to the hero button
const exploreBtn = document.querySelector(".exploreButton");
exploreBtn.addEventListener("click", scrollToArticle);
