if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});

const navLogin = document.getElementById("nav-login");

navLogin.addEventListener("click", handleLogin);

function handleLogin(e) {
  e.preventDefault(); // ⛔ bloque la redirection automatique

  navLogin.textContent = "Loading...";

  setTimeout(() => {
    window.location.href = "./login.html";
  }, 500);
}

const navRegister = document.getElementById("nav-register");
navRegister.addEventListener("click", handleregister);

function handleregister(e) {
  e.preventDefault(); // ⛔ bloque la redirection automatique

  navRegister.textContent = "Loading...";

  setTimeout(() => {
    window.location.href = "./register.html";
  }, 500);
}





















const logoImg = document.querySelector(".brand img");
logoLink.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.reload();
});


