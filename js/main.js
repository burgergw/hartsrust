(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  // Expandable submenus (Accommodation / Hunting Safaris) on small screens.
  var submenuToggles = document.querySelectorAll(".submenu-toggle");
  submenuToggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var parent = btn.closest(".has-submenu");
      var submenu = btn.nextElementSibling;
      var isDesktop = window.matchMedia("(min-width: 900px)").matches;

      if (isDesktop) {
        return; // desktop uses hover/focus, handled purely in CSS
      }

      var expanded = parent.getAttribute("aria-expanded") === "true";
      parent.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (submenu) {
        submenu.classList.toggle("is-open", !expanded);
      }
    });
  });

  // Close the mobile menu when a link is clicked (keeps navigation snappy).
  nav && nav.addEventListener("click", function (event) {
    var link = event.target.closest("a");
    if (link && window.matchMedia("(max-width: 899px)").matches) {
      nav.classList.remove("is-open");
      toggle && toggle.setAttribute("aria-expanded", "false");
    }
  });

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
