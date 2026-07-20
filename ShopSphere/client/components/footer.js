export function mountFooter() {
  document.getElementById("footer").innerHTML = `
    <footer class="footer">
      <div class="container footer-inner">
        <div>
          <strong>ShopSphere</strong>
          <p>Curated tech, fashion, accessories, and lifestyle essentials.</p>
        </div>
        <div>
          <p>Support: support@shopsphere.test</p>
          <p>Coupons: SAVE20, WELCOME10, FREESHIP</p>
        </div>
      </div>
    </footer>
  `;
}
