import { boot, formatCurrency, getProducts, requireAuth, toast } from "./app.js";

boot("Admin");

if (!requireAuth()) {
  throw new Error("Authentication required");
}

const orders = JSON.parse(localStorage.getItem("shopsphere_orders") || "[]");
const users = JSON.parse(localStorage.getItem("shopsphere_users") || "[]");
const revenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
const result = await getProducts({ limit: 50 });
const products = result.products;
const inventoryValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);
const lowStock = products.filter((product) => product.stock <= 15).length;
const categories = products.reduce((summary, product) => {
  summary[product.category] = (summary[product.category] || 0) + 1;
  return summary;
}, {});

document.getElementById("adminMetrics").innerHTML = `
  <div class="mini-feature"><strong>Products</strong><p>${products.length} active listings</p></div>
  <div class="mini-feature"><strong>Orders</strong><p>${orders.length} total orders</p></div>
  <div class="mini-feature"><strong>Users</strong><p>${users.length || 1} visible users</p></div>
  <div class="mini-feature"><strong>Revenue</strong><p>${formatCurrency(revenue)}</p></div>
`;

document.getElementById("adminAnalytics").innerHTML = `
  <div class="panel detail-panel">
    <span class="eyebrow">Inventory</span>
    <h2>${formatCurrency(inventoryValue)}</h2>
    <p>Total stock value across current catalog.</p>
  </div>
  <div class="panel detail-panel">
    <span class="eyebrow">Low Stock</span>
    <h2>${lowStock}</h2>
    <p>Products with 15 or fewer units available.</p>
  </div>
  <div class="panel detail-panel">
    <span class="eyebrow">Categories</span>
    ${Object.entries(categories).map(([category, count]) => `<p><strong>${category}</strong>: ${count} products</p>`).join("")}
  </div>
`;

document.getElementById("adminProducts").innerHTML = products
  .map((product) => `
    <article class="cart-row">
      <img src="${product.images[0]}" alt="${product.name}">
      <div>
        <h3>${product.name}</h3>
        <p>${product.category} / Stock: ${product.stock} / Rating: ${product.rating}</p>
      </div>
      <strong class="price">${formatCurrency(product.price)}</strong>
    </article>
  `)
  .join("");

document.getElementById("productForm").addEventListener("submit", (event) => {
  event.preventDefault();
  toast("Admin product form is ready for POST /api/product");
  event.target.reset();
});
