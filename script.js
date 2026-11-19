document.querySelectorAll(".newsletter").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector("#menu");

if (menuToggle && mobileNav) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Otvoriť menu");
    mobileNav.hidden = true;
  };

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeMenu();
      return;
    }

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Zavrieť menu");
    mobileNav.hidden = false;
  });

  mobileNav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });

  window.matchMedia("(min-width: 769px)").addEventListener("change", (event) => {
    if (event.matches) {
      closeMenu();
    }
  });
}
