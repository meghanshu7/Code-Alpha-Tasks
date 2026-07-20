import { boot, requireAuth, sampleProducts } from "./app.js";

boot("Profile");

if (!requireAuth()) {
  throw new Error("Authentication required");
}

const user = JSON.parse(localStorage.getItem("shopsphere_user") || "null");
const wishlist = JSON.parse(localStorage.getItem("shopsphere_wishlist") || "[]");
const recent = JSON.parse(localStorage.getItem("shopsphere_recent") || "[]");

document.getElementById("profilePanel").innerHTML = `
  <section class="panel detail-panel">
    <span class="eyebrow">User Dashboard</span>
    <h1>${user?.name || "Guest User"}</h1>
    <p>${user?.email || "Login to sync your profile, cart, wishlist, and orders."}</p>
    <div class="feature-strip">
      <div class="mini-feature"><strong>My Orders</strong><p>Track active and previous purchases.</p></div>
      <div class="mini-feature"><strong>Wishlist</strong><p>${wishlist.length} saved products.</p></div>
      <div class="mini-feature"><strong>Addresses</strong><p>Manage delivery locations.</p></div>
      <div class="mini-feature"><strong>Settings</strong><p>Theme and account preferences.</p></div>
    </div>
    <button class="btn-danger" id="logoutBtn" style="margin-top:18px;">Logout</button>
  </section>
`;

document.getElementById("wishlistPanel").innerHTML = (wishlist.length ? wishlist : sampleProducts.slice(0, 2))
  .map((product) => `<p><strong>${product.name}</strong> <span class="price">${product.price ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(product.price) : ""}</span></p>`)
  .join("");

document.getElementById("recentPanel").innerHTML = (recent.length ? recent : sampleProducts.slice(2, 5))
  .map((product) => `<p>${product.name}</p>`)
  .join("");

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("shopsphere_user");
  localStorage.removeItem("shopsphere_token");
  location.href = "/pages/login.html";
});
