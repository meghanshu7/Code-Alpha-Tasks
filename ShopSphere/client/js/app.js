import { mountNavbar } from "../components/navbar.js";
import { mountFooter } from "../components/footer.js";

export const API = "/api";

export const sampleProducts = [
  {
    _id: "p1",
    name: "AeroBook Pro 14 Laptop",
    description: "A lightweight productivity laptop with a vivid display, long battery life, and fast storage.",
    price: 74999,
    category: "Laptop",
    stock: 9,
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80"],
    rating: 4.8,
    brand: "Aero",
    discount: 12,
    featured: true,
    trending: true
  },
  {
    _id: "p2",
    name: "StrideX Running Shoes",
    description: "Breathable daily trainers with cushioned soles and strong grip for city runs.",
    price: 3499,
    category: "Shoes",
    stock: 24,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"],
    rating: 4.5,
    brand: "StrideX",
    discount: 20,
    featured: true,
    trending: false
  },
  {
    _id: "p3",
    name: "Nova Watch Active",
    description: "Smart watch with AMOLED display, health tracking, GPS, and seven-day battery life.",
    price: 8999,
    category: "Watch",
    stock: 16,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"],
    rating: 4.6,
    brand: "Nova",
    discount: 8,
    featured: false,
    trending: true
  },
  {
    _id: "p4",
    name: "Everyday Linen Shirt",
    description: "Soft linen blend shirt with relaxed tailoring for warm weather and layered outfits.",
    price: 1599,
    category: "Clothes",
    stock: 32,
    images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80"],
    rating: 4.3,
    brand: "Threadly",
    discount: 15,
    featured: true,
    trending: false
  },
  {
    _id: "p5",
    name: "PixelMax 5G Phone",
    description: "Fast 5G phone with a sharp OLED screen, reliable camera system, and all-day battery.",
    price: 32999,
    category: "Phone",
    stock: 13,
    images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80"],
    rating: 4.7,
    brand: "PixelMax",
    discount: 10,
    featured: false,
    trending: true
  },
  {
    _id: "p6",
    name: "Studio Wireless Headphones",
    description: "Noise cancelling headphones with balanced sound and comfortable ear cushions.",
    price: 6499,
    category: "Accessories",
    stock: 18,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"],
    rating: 4.4,
    brand: "Studio",
    discount: 18,
    featured: true,
    trending: true
  }
];

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem("shopsphere_user") || "null");
}

export function isLoggedIn() {
  return Boolean(getCurrentUser() && localStorage.getItem("shopsphere_token"));
}

export function showAuthRequired(container = document.querySelector("main")) {
  if (!container) return;
  container.innerHTML = `
    <section class="auth-shell">
      <div class="auth-box">
        <span class="eyebrow">New User</span>
        <h1>Please sign in first</h1>
        <p>You need to login with an existing account or create a new account before browsing products, adding items to cart, or placing orders.</p>
        <a class="btn full-width" href="/pages/login.html?auth=required">Login</a>
        <a class="btn-outline full-width" href="/pages/register.html" style="margin-top:10px;">Create Account</a>
      </div>
    </section>
  `;
}

export function requireAuth(container = document.querySelector("main")) {
  if (isLoggedIn()) return true;
  localStorage.removeItem("shopsphere_user");
  localStorage.removeItem("shopsphere_token");
  showAuthRequired(container);
  return false;
}

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("shopsphere_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    ...options,
    headers
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function getProducts(params = {}) {
  const query = new URLSearchParams(params);
  try {
    const result = await apiFetch(`/products?${query}`);
    if (result.products?.length) return result;
  } catch (error) {
    // Use local products when the API is offline.
  }
  let products = [...sampleProducts];
  if (params.search) {
    const search = params.search.toLowerCase();
    products = products.filter((product) =>
      [product.name, product.description, product.brand, product.category].join(" ").toLowerCase().includes(search)
    );
  }
  if (params.category) products = products.filter((product) => product.category === params.category);
  if (params.minPrice) products = products.filter((product) => product.price >= Number(params.minPrice));
  if (params.maxPrice) products = products.filter((product) => product.price <= Number(params.maxPrice));
  if (params.sort === "price_asc") products.sort((a, b) => a.price - b.price);
  if (params.sort === "price_desc") products.sort((a, b) => b.price - a.price);
  if (params.sort === "rating") products.sort((a, b) => b.rating - a.rating);
  return { products, pagination: { page: 1, pages: 1, total: products.length } };
}

export function getStoredCart() {
  return JSON.parse(localStorage.getItem("shopsphere_cart") || "[]");
}

export function saveStoredCart(cart) {
  localStorage.setItem("shopsphere_cart", JSON.stringify(cart));
}

export function addLocalCart(product, quantity = 1) {
  if (!isLoggedIn()) {
    toast("New user? Please sign in first");
    setTimeout(() => {
      location.href = "/pages/login.html?auth=required";
    }, 700);
    return;
  }
  const cart = getStoredCart();
  const item = cart.find((entry) => entry._id === product._id);
  if (item) item.quantity += quantity;
  else cart.push({ ...product, quantity });
  saveStoredCart(cart);
  toast("Added to cart");
}

export function toggleLocalWishlist(product) {
  if (!isLoggedIn()) {
    toast("Please sign in first");
    setTimeout(() => {
      location.href = "/pages/login.html?auth=required";
    }, 700);
    return;
  }
  const wishlist = JSON.parse(localStorage.getItem("shopsphere_wishlist") || "[]");
  const exists = wishlist.some((item) => item._id === product._id);
  const next = exists ? wishlist.filter((item) => item._id !== product._id) : [...wishlist, product];
  localStorage.setItem("shopsphere_wishlist", JSON.stringify(next));
  toast(exists ? "Removed from wishlist" : "Saved to wishlist");
}

export function addRecentlyViewed(product) {
  const viewed = JSON.parse(localStorage.getItem("shopsphere_recent") || "[]").filter((item) => item._id !== product._id);
  localStorage.setItem("shopsphere_recent", JSON.stringify([product, ...viewed].slice(0, 6)));
}

export function getCompareItems() {
  return JSON.parse(localStorage.getItem("shopsphere_compare") || "[]");
}

export function toggleCompare(product) {
  let compare = getCompareItems();
  const exists = compare.some((item) => item._id === product._id);
  if (exists) {
    compare = compare.filter((item) => item._id !== product._id);
    toast("Removed from comparison");
  } else if (compare.length >= 2) {
    compare = [compare[1], product];
    toast("Comparison updated");
  } else {
    compare.push(product);
    toast("Added to comparison");
  }
  localStorage.setItem("shopsphere_compare", JSON.stringify(compare));
  renderCompareTray();
}

export function renderCompareTray() {
  let tray = document.getElementById("compareTray");
  const compare = getCompareItems();
  if (!tray) {
    tray = document.createElement("aside");
    tray.id = "compareTray";
    tray.className = "compare-tray";
    document.body.appendChild(tray);
  }
  if (!compare.length) {
    tray.classList.remove("show");
    tray.innerHTML = "";
    return;
  }
  tray.innerHTML = `
    <div>
      <strong>Compare Products</strong>
      <p>${compare.length}/2 selected</p>
    </div>
    <div class="compare-items">
      ${compare.map((item) => `
        <div>
          <span>${item.name}</span>
          <strong>${formatCurrency(item.price)}</strong>
        </div>
      `).join("")}
    </div>
    <button class="btn-outline" id="clearCompare">Clear</button>
  `;
  tray.classList.add("show");
  document.getElementById("clearCompare")?.addEventListener("click", () => {
    localStorage.removeItem("shopsphere_compare");
    renderCompareTray();
  });
}

export function productCard(product) {
  const stockLabel = product.stock > 20 ? "In Stock" : product.stock > 0 ? "Few Left" : "Sold Out";
  return `
    <article class="product-card">
      <div class="product-badges">
        ${product.featured ? `<span>Featured</span>` : ""}
        ${product.trending ? `<span>Trending</span>` : ""}
      </div>
      <a class="product-media" href="/pages/product.html?id=${product._id}">
        <img src="${product.images?.[0]}" alt="${product.name}" loading="lazy">
      </a>
      <div class="product-body">
        <div class="product-meta">
          <span class="eyebrow">${product.category}</span>
          <span class="rating">★ ${Number(product.rating || 0).toFixed(1)}</span>
        </div>
        <h3><a href="/pages/product.html?id=${product._id}">${product.name}</a></h3>
        <p>${product.description}</p>
        <div class="price-line">
          <span class="price">${formatCurrency(product.price)}</span>
          <span>${product.discount || 0}% off</span>
        </div>
        <div class="stock-pill">${stockLabel} · ${product.stock || 0} units</div>
        <div class="card-actions">
          <button class="btn add-cart" data-id="${product._id}">Add to Cart</button>
          <button class="icon-btn save-wish" data-id="${product._id}" title="Wishlist">♡</button>
          <button class="icon-btn compare-product" data-id="${product._id}" title="Compare">C</button>
        </div>
      </div>
    </article>
  `;
}

export function wireProductActions(products) {
  document.querySelectorAll(".add-cart").forEach((button) => {
    button.addEventListener("click", () => {
      const product = products.find((item) => item._id === button.dataset.id);
      addLocalCart(product);
    });
  });
  document.querySelectorAll(".save-wish").forEach((button) => {
    button.addEventListener("click", () => {
      const product = products.find((item) => item._id === button.dataset.id);
      toggleLocalWishlist(product);
    });
  });
  document.querySelectorAll(".compare-product").forEach((button) => {
    button.addEventListener("click", () => {
      const product = products.find((item) => item._id === button.dataset.id);
      toggleCompare(product);
    });
  });
  renderCompareTray();
}

export function toast(message) {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

export function boot(active = "") {
  document.documentElement.dataset.theme = localStorage.getItem("shopsphere_theme") || "light";
  mountNavbar(active);
  mountFooter();
  renderCompareTray();
}
