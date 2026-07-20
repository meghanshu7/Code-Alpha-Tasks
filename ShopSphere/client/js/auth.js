import { apiFetch, boot, toast } from "./app.js";

boot(location.pathname.includes("register") ? "Register" : "Login");

const authNotice = new URLSearchParams(location.search).get("auth");
if (authNotice === "required") {
  const form = document.querySelector("form");
  form?.insertAdjacentHTML(
    "afterbegin",
    `<div class="auth-message">New user? Please sign in first to continue shopping.</div>`
  );
}

const form = document.querySelector("form");
const showAuthMessage = (message, type = "error") => {
  const oldMessage = form.querySelector(".auth-message");
  oldMessage?.remove();
  form.insertAdjacentHTML("afterbegin", `<div class="auth-message ${type}">${message}</div>`);
};

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    showAuthMessage("Passwords do not match. Please check both password fields.");
    return;
  }

  const endpoint = form.dataset.mode === "register" ? "/register" : "/login";
  try {
    const result = await apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(data)
    });
    localStorage.setItem("shopsphere_token", result.token);
    localStorage.setItem("shopsphere_user", JSON.stringify(result.user));
    location.href = "/pages/index.html";
  } catch (error) {
    localStorage.removeItem("shopsphere_token");
    localStorage.removeItem("shopsphere_user");
    if (form.dataset.mode === "login") {
      showAuthMessage(
        `Oops, we do not have an account with these details. No worries, <a href="/pages/register.html">create an account</a> first.`
      );
      toast("Account not found. Please create an account first.");
      return;
    }
    if (error.message === "Email already registered") {
      showAuthMessage(`This email already has an account. Please <a href="/pages/login.html">login here</a>.`);
      return;
    }
    showAuthMessage(error.message || "Something went wrong. Please try again.");
  }
});
