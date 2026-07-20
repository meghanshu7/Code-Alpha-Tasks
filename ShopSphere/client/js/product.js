import {
  addLocalCart,
  addRecentlyViewed,
  boot,
  formatCurrency,
  getProducts,
  productCard,
  requireAuth,
  sampleProducts,
  toggleLocalWishlist,
  wireProductActions
} from "./app.js";

boot("Products");

if (!requireAuth()) {
  throw new Error("Authentication required");
}

const params = new URLSearchParams(location.search);
const detailId = params.get("id");

if (detailId) {
  document.getElementById("listingPage").style.display = "none";
  renderDetail();
} else {
  renderListing();
}

async function renderListing() {
  const form = document.getElementById("filterForm");
  const grid = document.getElementById("productGrid");
  const pageInfo = document.getElementById("pageInfo");
  for (const [key, value] of params.entries()) {
    const field = form.elements[key];
    if (field) field.value = value;
  }

  async function load() {
    grid.innerHTML = `<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>`;
    const filters = Object.fromEntries(new FormData(form));
    const { products, pagination } = await getProducts(filters);
    grid.innerHTML = products.map(productCard).join("") || "<p>No products found.</p>";
    pageInfo.textContent = `${pagination.total} products found`;
    wireProductActions(products);
  }

  form.addEventListener("input", load);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    load();
  });

  load();
}

async function renderDetail() {
  const detail = document.getElementById("productDetail");
  let product = sampleProducts.find((item) => item._id === detailId);
  let related = [];
  if (!product) {
    try {
      const response = await fetch(`/api/product/${detailId}`);
      if (response.ok) {
        const data = await response.json();
        product = data.product;
        related = data.related || [];
      }
    } catch (error) {
      product = sampleProducts[0];
    }
  }
  product = product || sampleProducts[0];
  addRecentlyViewed(product);
  related = related.length
    ? related
    : sampleProducts.filter((item) => item.category === product.category && item._id !== product._id);
  const fallbackImage = "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80";
  const imageList = product.images?.length ? product.images : [fallbackImage];
  const images = [...imageList, ...imageList, ...imageList].slice(0, 4);

  detail.innerHTML = `
    <div class="detail-grid">
      <div>
        <div class="gallery-main">
          <img id="mainImage" src="${imageList[0]}" alt="${product.name}">
        </div>
        <div class="thumb-row">
          ${images.map((src, index) => `<img src="${src}" alt="${product.name} view ${index + 1}" class="${index === 0 ? "active" : ""}">`).join("")}
        </div>
      </div>
      <section class="panel detail-panel">
        <span class="eyebrow">${product.brand} / ${product.category}</span>
        <h1>${product.name}</h1>
        <p>${product.description}</p>
        <div class="detail-price">${formatCurrency(product.price)}</div>
        <p class="stock ${product.stock ? "" : "out"}">${product.stock ? `${product.stock} in stock` : "Out of stock"}</p>
        <div class="price-line">
          <span class="rating">★ ${product.rating}</span>
          <span>${product.discount}% discount</span>
        </div>
        <div class="card-actions" style="grid-template-columns: 1fr 1fr 44px;">
          <button class="btn" id="detailCart">Add to Cart</button>
          <a class="btn-outline" href="/pages/checkout.html">Buy Now</a>
          <button class="icon-btn" id="detailWish" title="Wishlist">♡</button>
        </div>
      </section>
    </div>
    <section class="section">
      <div class="section-head">
        <div>
          <span class="eyebrow">Ratings</span>
          <h2>Review Distribution</h2>
        </div>
      </div>
      <div class="panel detail-panel rating-bars">
        ${[80, 10, 6, 2, 2].map((value, index) => `
          <div class="rating-bar"><span>${5 - index}★</span><div class="bar"><span style="width:${value}%"></span></div><span>${value}%</span></div>
        `).join("")}
      </div>
    </section>
    <section class="section">
      <div class="section-head"><h2>Related Products</h2></div>
      <div class="grid product-grid">${related.map(productCard).join("")}</div>
    </section>
  `;

  document.getElementById("detailCart").addEventListener("click", () => addLocalCart(product));
  document.getElementById("detailWish").addEventListener("click", () => toggleLocalWishlist(product));
  wireProductActions(related);
}
