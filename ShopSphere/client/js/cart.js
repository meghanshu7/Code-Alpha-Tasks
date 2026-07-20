import { boot, formatCurrency, getStoredCart, requireAuth, saveStoredCart, toast } from "./app.js";

boot("Cart");

if (!requireAuth()) {
  throw new Error("Authentication required");
}

renderCart();

function totals(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const coupon = localStorage.getItem("shopsphere_coupon");
  const discount = coupon === "SAVE20" ? subtotal * 0.2 : coupon === "WELCOME10" ? subtotal * 0.1 : 0;
  return { subtotal, discount, total: subtotal - discount };
}

function renderCart() {
  const cart = getStoredCart();
  const list = document.getElementById("cartList");
  const summary = document.getElementById("cartSummary");

  list.innerHTML = cart.length
    ? cart.map((item) => `
      <article class="cart-row">
        <img src="${item.images?.[0]}" alt="${item.name}">
        <div>
          <h3>${item.name}</h3>
          <p>${item.category} / ${item.brand}</p>
          <div class="qty-control">
            <button data-action="dec" data-id="${item._id}">−</button>
            <span>${item.quantity}</span>
            <button data-action="inc" data-id="${item._id}">+</button>
          </div>
          <button class="btn-outline" data-action="remove" data-id="${item._id}">Remove</button>
        </div>
        <strong class="price">${formatCurrency(item.price * item.quantity)}</strong>
      </article>
    `).join("")
    : "<p>Your cart is empty.</p>";

  const cartTotals = totals(cart);
  summary.innerHTML = `
    <h2>Summary</h2>
    <div class="summary-line"><span>Subtotal</span><strong>${formatCurrency(cartTotals.subtotal)}</strong></div>
    <div class="summary-line"><span>Discount</span><strong>${formatCurrency(cartTotals.discount)}</strong></div>
    <div class="summary-line total"><span>Total</span><strong>${formatCurrency(cartTotals.total)}</strong></div>
    <form class="coupon" id="couponForm">
      <input name="coupon" placeholder="Coupon code">
      <button class="btn-outline">Apply</button>
    </form>
    <a class="btn full-width" href="/pages/checkout.html" style="margin-top:14px;">Checkout</a>
  `;

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => updateCart(button.dataset.id, button.dataset.action));
  });
  document.getElementById("couponForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const coupon = new FormData(event.target).get("coupon").toUpperCase();
    localStorage.setItem("shopsphere_coupon", coupon);
    toast("Coupon applied");
    renderCart();
  });
}

function updateCart(id, action) {
  let cart = getStoredCart();
  cart = cart
    .map((item) => {
      if (item._id !== id) return item;
      if (action === "inc") item.quantity += 1;
      if (action === "dec") item.quantity = Math.max(1, item.quantity - 1);
      return item;
    })
    .filter((item) => action !== "remove" || item._id !== id);
  saveStoredCart(cart);
  renderCart();
}
