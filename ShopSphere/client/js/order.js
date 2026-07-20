import { boot, formatCurrency, getStoredCart, requireAuth, saveStoredCart, toast } from "./app.js";

const isCheckout = location.pathname.includes("checkout");
boot(isCheckout ? "Checkout" : "Orders");

if (!requireAuth()) {
  throw new Error("Authentication required");
}

if (isCheckout) renderCheckout();
else renderOrders();

function renderCheckout() {
  const cart = getStoredCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.getElementById("checkoutTotal").textContent = formatCurrency(subtotal);

  document.getElementById("checkoutForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!cart.length) {
      toast("Cart is empty");
      return;
    }
    const orders = JSON.parse(localStorage.getItem("shopsphere_orders") || "[]");
    const order = {
      _id: `ORD-${Date.now()}`,
      products: cart,
      totalPrice: subtotal,
      orderStatus: "Placed",
      paymentStatus: "Pending",
      shippingAddress: Object.fromEntries(new FormData(event.target)),
      createdAt: new Date().toISOString()
    };
    localStorage.setItem("shopsphere_orders", JSON.stringify([order, ...orders]));
    saveStoredCart([]);
    location.href = `/pages/orders.html?success=${order._id}`;
  });
}

function renderOrders() {
  const orders = JSON.parse(localStorage.getItem("shopsphere_orders") || "[]");
  const success = new URLSearchParams(location.search).get("success");
  const list = document.getElementById("orderList");
  if (success) {
    document.getElementById("successBox").innerHTML = `
      <section class="panel detail-panel">
        <span class="eyebrow">Order Success</span>
        <h1>Order placed</h1>
        <p>Order ID: ${success}</p>
        <a class="btn" href="/pages/product.html">Continue Shopping</a>
        <button class="btn-outline" onclick="window.print()">Invoice</button>
      </section>
    `;
  }

  list.innerHTML = orders.length
    ? orders.map((order) => `
      <article class="order-row detail-panel">
        <div class="price-line">
          <div>
            <h3>${order._id}</h3>
            <p>${new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <strong>${formatCurrency(order.totalPrice)}</strong>
        </div>
        <p>Status: ${order.orderStatus} / Payment: ${order.paymentStatus}</p>
        <p>Tracking: Placed → Packed → Shipped → Out for Delivery → Delivered</p>
      </article>
    `).join("")
    : "<p>No orders yet.</p>";
}
