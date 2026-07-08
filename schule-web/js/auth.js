const ADMIN_USER = "admin";
const ADMIN_PASS = "admin";
const ADMIN_STORAGE_KEY = "ers_admin_logged_in";

function isAdminLoggedIn() {
  return localStorage.getItem(ADMIN_STORAGE_KEY) === "true";
}

function setAdminLoggedIn(value) {
  if (value) {
    localStorage.setItem(ADMIN_STORAGE_KEY, "true");
  } else {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const loginStatus = document.getElementById("login-status");

  if (loginForm) {
    if (isAdminLoggedIn()) {
      window.location.href = "admin.html";
      return;
    }

    loginForm.addEventListener("submit", event => {
      event.preventDefault();

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;

      if (username === ADMIN_USER && password === ADMIN_PASS) {
        setAdminLoggedIn(true);
        if (loginStatus) {
          loginStatus.textContent = "Login erfolgreich. Weiterleitung...";
          loginStatus.style.color = "#16a34a";
        }
        setTimeout(() => {
          window.location.href = "admin.html";
        }, 600);
      } else {
        setAdminLoggedIn(false);
        if (loginStatus) {
          loginStatus.textContent = "Benutzername oder Passwort ist falsch.";
          loginStatus.style.color = "#dc2626";
        }
      }
    });
  }

  const adminPage = document.getElementById("admin-page");
  const logoutBtn = document.getElementById("logout-btn");

  if (adminPage) {
    if (!isAdminLoggedIn()) {
      window.location.href = "admin-login.html";
      return;
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        setAdminLoggedIn(false);
        window.location.href = "admin-login.html";
      });
    }
  }
});
