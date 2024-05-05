// Handle tombol kategori
document.querySelectorAll(".category").forEach((category) => {
  category.addEventListener("click", async () => {
    const categoryName = category.dataset.category;
    // Remove active class
    document.querySelectorAll(".category").forEach((cat) => {
      cat.classList.remove("active");
    });
    // Add active class
    category.classList.add("active");
    const response = await fetch(`/category?category=${categoryName}`);
    const data = await response.json();
    updateBlogCards(data.blogs);
    // Show or hide load more button 
    showHideLoadMoreButton(data.blogs);
  });
});

// Handle button load more
document.getElementById("load-more-btn").addEventListener("click", async () => {
  const category = getCurrentCategory(); 
  const skip = getCurrentBlogCount();
  const response = await fetch(`/load-more?category=${category}&skip=${skip}`);
  const data = await response.json();
  appendBlogCards(data);
  showHideLoadMoreButton(data);
});

// Update DOM dengan blog yang telah di fetch
function updateBlogCards(blogs) {
  // Clear data yang sudah ada
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

function appendBlogCards(blogs) {
  const container = document.querySelector(".blog-container");
  blogs.forEach((blog) => {
    const blogCard = createBlogCard(blog);
    container.appendChild(blogCard);
  });
}

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

function clearBlogCards() {
  const container = document.querySelector(".blog-container");
  container.innerHTML = ""; // Clear container
}

function getCurrentCategory() {
  const activeCategory = document.querySelector(".category.active");
  if (activeCategory) {
    return activeCategory.dataset.category;
  }
  return "All"; 
}

function getCurrentBlogCount() {
  const container = document.querySelector(".blog-container");
  return container.children.length; 
}

function showHideLoadMoreButton(blogs) {
  const loadMoreButton = document.getElementById("load-more-btn");
  if (blogs.length < 6) {
    loadMoreButton.style.display = "none";
  } else{
    loadMoreButton.style.display = "inline-block";
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch(`/category?category=All`);
  const data = await response.json();
  updateBlogCards(data.blogs);
  showHideLoadMoreButton(data.blogs);
});

function scrollToArticle() {
  
  const article = document.querySelector(".blog");

  article.scrollIntoView({ behavior: "smooth" });
}

const exploreBtn = document.querySelector(".exploreButton");
exploreBtn.addEventListener("click", scrollToArticle);
