export function renderNavbar(active = "") {
  const currentUser = JSON.parse(localStorage.getItem("shopsphere_user") || "null");
  const isLoggedIn = Boolean(currentUser && localStorage.getItem("shopsphere_token"));
  const links = [
    ["Home", "/pages/index.html"],
    ["Products", "/pages/product.html"],
    ["Cart", "/pages/cart.html"],
    ["Orders", "/pages/orders.html"],
    ["Profile", "/pages/profile.html"],
    ["Admin", "/pages/admin.html"]
  ];

  return `
    <header class="navbar">
      <div class="container nav-inner">
        <a class="brand" href="/pages/index.html" aria-label="ShopSphere home">
          <span class="brand-mark">S</span>
          <span>ShopSphere</span>
        </a>
        <nav class="nav-links" id="navLinks">
          ${links
            .map(([label, href]) => `<a href="${href}" class="${active === label ? "active" : ""}">${label}</a>`)
            .join("")}
        </nav>
        <div class="nav-actions">
          <a class="btn-outline nav-cta" href="/pages/product.html">Shop Now</a>
          <button class="icon-btn" id="themeToggle" title="Toggle dark mode">◐</button>
          <a class="btn-outline" href="/pages/cart.html">Cart</a>
          <a class="btn-outline" href="${isLoggedIn ? "/pages/profile.html" : "/pages/login.html"}">
            ${isLoggedIn ? currentUser.name.split(" ")[0] : "Login"}
          </a>
          <button class="menu-btn" id="menuToggle" title="Menu">☰</button>
        </div>
      </div>
    </header>
  `;
}

export function mountNavbar(active) {
  document.getElementById("navbar").innerHTML = renderNavbar(active);
  document.getElementById("menuToggle")?.addEventListener("click", () => {
    document.getElementById("navLinks").classList.toggle("open");
  });
  document.getElementById("themeToggle")?.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("shopsphere_theme", nextTheme);
  });
}
