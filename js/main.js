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

  // ---------- Home hero: keep the photo's subject clear of the text ----------
  // The img carries data-subject="x1,y1,x2,y2" (natural pixels). Shift the
  // crop so the subject stands in the gap between .hero-brand and .hero-copy;
  // if there's no room for it, slide it out of frame sideways instead.
  var heroImg = document.querySelector(".home-hero > img[data-subject]");
  function placeHeroSubject() {
    var hero = heroImg.parentElement;
    var brand = hero.querySelector(".hero-brand");
    var copy = hero.querySelector(".hero-copy");
    if (!brand || !copy) return;
    var box = heroImg.dataset.subject.split(",").map(Number);
    var nw = heroImg.naturalWidth || 1600, nh = heroImg.naturalHeight || 1066;
    var W = hero.clientWidth, H = hero.clientHeight;
    var s = Math.max(W / nw, H / nh), iw = nw * s, ih = nh * s;
    var top = hero.getBoundingClientRect().top;
    var gapTop = brand.getBoundingClientRect().bottom - top;
    var gapBottom = copy.getBoundingClientRect().top - top;
    var oy = Math.min(0, Math.max(H - ih, (gapTop + gapBottom) / 2 - ((box[1] + box[3]) / 2) * s));
    var ox = (W - iw) / 2;
    var subjTop = oy + box[1] * s, subjBottom = oy + box[3] * s;
    if (subjTop < gapTop + 4 || subjBottom > gapBottom - 4) {
      if (box[0] * s > W) ox = 0;                      // crop from the left: subject off to the right
      else if (iw - box[2] * s >= W) ox = W - iw;      // crop from the right: subject off to the left
    }
    heroImg.style.objectPosition = Math.round(ox) + "px " + Math.round(oy) + "px";
  }
  if (heroImg) {
    var heroFrame = 0;
    var scheduleHero = function () { cancelAnimationFrame(heroFrame); heroFrame = requestAnimationFrame(placeHeroSubject); };
    if (heroImg.complete) scheduleHero(); else heroImg.addEventListener("load", scheduleHero);
    window.addEventListener("resize", scheduleHero);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleHero);
  }

  // ---------- Footer year ----------
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
