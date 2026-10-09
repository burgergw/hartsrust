(function () {
  "use strict";

  var desktop = window.matchMedia("(min-width: 1100px)");

  // ---------- Mobile menu ----------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");

  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });
  }

  // ---------- Submenus (Accommodation / Hunting Safaris) ----------
  // Desktop opens them on hover/focus in CSS; the buttons also toggle them
  // for touch and keyboard users at every size.
  var submenuToggles = document.querySelectorAll(".submenu-toggle");

  function closeSubmenus(except) {
    submenuToggles.forEach(function (btn) {
      if (btn === except) return;
      btn.setAttribute("aria-expanded", "false");
      var menu = document.getElementById(btn.getAttribute("aria-controls"));
      if (menu) menu.classList.remove("is-open");
    });
  }

  submenuToggles.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var menu = document.getElementById(btn.getAttribute("aria-controls"));
      var open = btn.getAttribute("aria-expanded") !== "true";
      if (desktop.matches) closeSubmenus(btn);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (menu) menu.classList.toggle("is-open", open);
    });
  });

  document.addEventListener("click", function (event) {
    if (desktop.matches && !event.target.closest(".has-submenu")) closeSubmenus();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    closeSubmenus();
    if (nav && nav.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Close the mobile menu after choosing a link.
  if (nav) {
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a") && !desktop.matches) setMenu(false);
    });
  }

  desktop.addEventListener("change", function () {
    setMenu(false);
    closeSubmenus();
  });

  // ---------- Gallery lightbox ----------
  var galleries = document.querySelectorAll(".gallery");
  if (galleries.length && typeof HTMLDialogElement === "function") {
    var dialog = document.createElement("dialog");
    dialog.className = "lightbox";
    dialog.setAttribute("aria-label", "Photo viewer");
    dialog.innerHTML =
      '<figure class="lightbox-figure"><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lightbox-close" aria-label="Close photo"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '<button type="button" class="lightbox-prev" aria-label="Previous photo"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>' +
      '<button type="button" class="lightbox-next" aria-label="Next photo"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>';
    document.body.appendChild(dialog);

    var bigImg = dialog.querySelector("img");
    var caption = dialog.querySelector("figcaption");
    var items = [];
    var current = 0;

    function show(index) {
      current = (index + items.length) % items.length;
      var link = items[current];
      var thumb = link.querySelector("img");
      bigImg.src = link.getAttribute("href");
      bigImg.alt = thumb ? thumb.alt : "";
      caption.textContent = thumb ? thumb.alt : "";
    }

    galleries.forEach(function (gallery) {
      gallery.querySelectorAll("a").forEach(function (link) {
        items.push(link);
        link.addEventListener("click", function (event) {
          event.preventDefault();
          show(items.indexOf(link));
          dialog.showModal();
        });
      });
    });

    dialog.querySelector(".lightbox-close").addEventListener("click", function () { dialog.close(); });
    dialog.querySelector(".lightbox-prev").addEventListener("click", function () { show(current - 1); });
    dialog.querySelector(".lightbox-next").addEventListener("click", function () { show(current + 1); });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog || event.target.classList.contains("lightbox-figure")) dialog.close();
    });
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") show(current - 1);
      if (event.key === "ArrowRight") show(current + 1);
    });
  }

  // ---------- Footer year ----------
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
