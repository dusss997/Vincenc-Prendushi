/* =========================================================
   Gjimnazi "Vinçenc Prendushi" — Durrës
   Interactions
   ========================================================= */

(function () {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  /* ---------- School year ---------- */
  function getSchoolYear() {
    const now = new Date();
    const year = now.getFullYear();
    // A new school year starts in August.
    const start = now.getMonth() >= 7 ? year : year - 1;
    return `${start}/${start + 1}`;
  }

  $$("[data-school-year]").forEach((el) => {
    el.textContent = getSchoolYear();
  });

  const currentYearEl = $("#current-year");
  if (currentYearEl) {
    currentYearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Header state ---------- */
  const header = $("#site-header");
  const toTop = $(".to-top");
  let scrollTicking = false;

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 12);
    if (toTop) toTop.classList.toggle("is-visible", y > 700);
    updateActiveNav(y);
    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );

  /* ---------- Active navigation ---------- */
  const navLinks = $$(".nav__link");
  const sectionIds = ["ballina", "rreth-nesh", "programet", "galeria", "regjistrimi", "kontakt"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function updateActiveNav(y) {
    if (!navLinks.length || !sections.length) return;
    const marker = y + 150;
    let activeId = sections[0].id;

    sections.forEach((section) => {
      if (section.offsetTop <= marker) activeId = section.id;
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  /* ---------- Mobile menu ---------- */
  const mobileToggle = $("#mobile-toggle");
  const mobilePanel = $("#mobile-panel");

  function setMobileMenu(open) {
    if (!mobileToggle || !mobilePanel) return;
    mobileToggle.setAttribute("aria-expanded", String(open));
    mobileToggle.setAttribute("aria-label", open ? "Mbyll menynë" : "Hap menynë");
    mobilePanel.hidden = !open;
  }

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", () => {
      setMobileMenu(mobileToggle.getAttribute("aria-expanded") !== "true");
    });

    $$("a", mobilePanel).forEach((link) => {
      link.addEventListener("click", () => setMobileMenu(false));
    });

    document.addEventListener("click", (event) => {
      if (mobileToggle.getAttribute("aria-expanded") !== "true") return;
      if (header && header.contains(event.target)) return;
      setMobileMenu(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) setMobileMenu(false);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMobileMenu(false);
    }
  });

  /* ---------- Reveal on scroll ---------- */
  const revealItems = $$(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  /* ---------- FAQ accordion ---------- */
  const faqItems = $$(".faq__item");

  faqItems.forEach((item) => {
    const button = $("button", item);
    const panel = $(".faq__panel", item);
    if (!button || !panel) return;

    button.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");

      faqItems.forEach((other) => {
        other.classList.remove("is-open");
        const otherButton = $("button", other);
        if (otherButton) otherButton.setAttribute("aria-expanded", "false");
      });

      if (willOpen) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Preselect grade from program cards ---------- */
  const gradeSelect = $("#grade");

  $$("[data-preselect]").forEach((link) => {
    link.addEventListener("click", () => {
      if (!gradeSelect) return;
      gradeSelect.value = link.dataset.preselect;
      gradeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });

  /* ---------- Lightbox ---------- */
  const lightbox = $("#lightbox");
  const lightboxImage = $("#lightbox-img");
  const lightboxCaption = $("#lightbox-caption");
  const lightboxClose = $(".lightbox__close");
  const lightboxPrev = $(".lightbox__nav--prev");
  const lightboxNext = $(".lightbox__nav--next");
  const lightboxTriggers = $$("[data-lightbox-src]");

  let lightboxIndex = 0;
  let lastFocusedElement = null;

  function renderLightbox() {
    const trigger = lightboxTriggers[lightboxIndex];
    if (!trigger) return;
    const src = trigger.dataset.lightboxSrc;
    const caption = trigger.dataset.caption || "";
    lightboxImage.src = src;
    lightboxImage.alt = caption;
    lightboxCaption.textContent = caption;
  }

  function openLightbox(index) {
    if (!lightbox) return;
    lightboxIndex = index;
    lastFocusedElement = document.activeElement;
    renderLightbox();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  }

  function stepLightbox(direction) {
    if (!lightboxTriggers.length) return;
    lightboxIndex =
      (lightboxIndex + direction + lightboxTriggers.length) % lightboxTriggers.length;
    renderLightbox();
  }

  lightboxTriggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => openLightbox(index));
  });

  if (lightbox) {
    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener("click", () => stepLightbox(-1));
    if (lightboxNext) lightboxNext.addEventListener("click", () => stepLightbox(1));

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepLightbox(-1);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepLightbox(1);
        return;
      }

      if (event.key === "Tab") {
        const focusable = $$("button, [href], input, select, textarea", lightbox).filter(
          (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ---------- Registration form ---------- */
  const form = $("#registration-form");
  const successPanel = $("#form-success");
  const successName = $("#success-name");
  const successRef = $("#success-ref");
  const sendEmailLink = $("#send-email");
  const printButton = $("#print-application");
  const newApplicationButton = $("#new-application");
  const printArea = $("#print-area");
  const consentField = $(".consent");

  let currentApplication = null;

  function fieldWrapper(field) {
    if (!field) return null;
    if (field.classList && field.classList.contains("field")) return field;
    return field.closest(".field");
  }

  function setFieldError(field, message) {
    const wrapper = fieldWrapper(field);
    if (!wrapper) return;
    const errorEl = $(".field__error", wrapper);
    const input = $("input, select, textarea", wrapper);

    if (message) {
      wrapper.classList.add("is-invalid");
      if (errorEl) errorEl.textContent = message;
      if (input) input.setAttribute("aria-invalid", "true");
    } else {
      wrapper.classList.remove("is-invalid");
      if (errorEl) errorEl.textContent = "";
      if (input) input.removeAttribute("aria-invalid");
    }
  }

  function clearAllErrors() {
    $$(".field.is-invalid").forEach((field) => setFieldError(field, ""));
  }

  function valueOf(id) {
    const field = document.getElementById(id);
    return field ? field.value.trim() : "";
  }

  function validateField(id) {
    const field = document.getElementById(id);
    if (!field) return true;

    let message = "";
    const value = field.value.trim();

    switch (id) {
      case "firstName":
        if (!value) message = "Shkruaj emrin e nxënësit.";
        else if (value.length < 2) message = "Emri duhet të ketë të paktën 2 shkronja.";
        break;
      case "lastName":
        if (!value) message = "Shkruaj mbiemrin e nxënësit.";
        else if (value.length < 2) message = "Mbiemri duhet të ketë të paktën 2 shkronja.";
        break;
      case "birthDate": {
        if (!value) {
          message = "Zgjidh datëlindjen.";
          break;
        }
        const date = new Date(`${value}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (Number.isNaN(date.getTime())) {
          message = "Datëlindja nuk është e vlefshme.";
        } else if (date > today) {
          message = "Datëlindja nuk mund të jetë në të ardhmen.";
        } else if (date.getFullYear() < today.getFullYear() - 30) {
          message = "Kontrollo datëlindjen.";
        }
        break;
      }
      case "grade":
        if (!value) message = "Zgjidh klasën.";
        break;
      case "previousSchool":
        if (!value) message = "Shkruaj shkollën e mëparshme.";
        else if (value.length < 2) message = "Shkruaj emrin e shkollës.";
        break;
      case "gpa":
        if (value) {
          const gpa = Number(value);
          if (Number.isNaN(gpa) || gpa < 4 || gpa > 10) {
            message = "Nota mesatare duhet të jetë midis 4 dhe 10.";
          }
        }
        break;
      case "email":
        if (!value) message = "Shkruaj adresën e emailit.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          message = "Shkruaj një adresë emaili të vlefshme.";
        }
        break;
      case "phone":
      case "parentPhone": {
        const digits = value.replace(/\D/g, "");
        if (!value) {
          message = id === "phone" ? "Shkruaj numrin e telefonit." : "Shkruaj telefonin e prindit.";
        } else if (digits.length < 7 || digits.length > 15) {
          message = "Numri i telefonit nuk është i vlefshëm.";
        }
        break;
      }
      case "parentName":
        if (!value) message = "Shkruaj emrin e prindit ose kujdestarit.";
        else if (value.length < 2) message = "Shkruaj emrin e plotë.";
        break;
      default:
        break;
    }

    setFieldError(field, message);
    return !message;
  }

  const requiredFields = [
    "firstName",
    "lastName",
    "birthDate",
    "grade",
    "previousSchool",
    "gpa",
    "email",
    "phone",
    "parentName",
    "parentPhone",
  ];

  requiredFields.forEach((id) => {
    const field = document.getElementById(id);
    if (!field) return;

    field.addEventListener("blur", () => validateField(id));
    field.addEventListener("input", () => {
      const wrapper = fieldWrapper(field);
      if (wrapper && wrapper.classList.contains("is-invalid")) validateField(id);
    });
    field.addEventListener("change", () => {
      const wrapper = fieldWrapper(field);
      if (wrapper && wrapper.classList.contains("is-invalid")) validateField(id);
    });
  });

  const consentInput = $("#consent");

  if (consentInput) {
    consentInput.addEventListener("change", () => {
      if (consentInput.checked) setFieldError(consentField, "");
    });
  }

  function validateConsent() {
    if (!consentInput) return true;
    if (!consentInput.checked) {
      setFieldError(consentField, "Duhet të pranosh kushtet për të vazhduar.");
      return false;
    }
    setFieldError(consentField, "");
    return true;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("sq-AL", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function makeReference() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `VP-${year}-${random}`;
  }

  function collectApplication() {
    return {
      ref: makeReference(),
      createdAt: new Date().toISOString(),
      firstName: valueOf("firstName"),
      lastName: valueOf("lastName"),
      birthDate: valueOf("birthDate"),
      grade: valueOf("grade"),
      previousSchool: valueOf("previousSchool"),
      gpa: valueOf("gpa"),
      email: valueOf("email"),
      phone: valueOf("phone"),
      parentName: valueOf("parentName"),
      parentPhone: valueOf("parentPhone"),
      message: valueOf("message"),
    };
  }

  function saveApplication(application) {
    try {
      const key = "vp_gjimnazi_applications";
      const stored = JSON.parse(window.localStorage.getItem(key) || "[]");
      const applications = Array.isArray(stored) ? stored : [];
      applications.push(application);
      window.localStorage.setItem(key, JSON.stringify(applications));
    } catch (error) {
      // Storage may be unavailable (private mode, disabled cookies). The form still works.
      console.warn("Ruajtja lokale nuk është e disponueshme.", error);
    }
  }

  function buildEmailLink(application) {
    if (!sendEmailLink) return;

    const fullName = `${application.firstName} ${application.lastName}`.trim();
    const subject = `Kërkesë regjistrimi ${application.grade} — ${fullName} (${application.ref})`;
    const body = [
      "Kërkesë regjistrimi — Gjimnazi “Vinçenc Prendushi”, Durrës",
      "",
      `Numri i kërkesës: ${application.ref}`,
      `Data: ${formatDate(application.createdAt.slice(0, 10))}`,
      "",
      `Nxënësi: ${fullName}`,
      `Datëlindja: ${formatDate(application.birthDate)}`,
      `Klasa: ${application.grade}`,
      `Shkolla e mëparshme: ${application.previousSchool}`,
      `Nota mesatare: ${application.gpa || "—"}`,
      "",
      `Email: ${application.email}`,
      `Telefoni: ${application.phone}`,
      `Prindi/kujdestari: ${application.parentName}`,
      `Telefoni i prindit: ${application.parentPhone}`,
      "",
      "Mesazh:",
      application.message || "—",
      "",
      "—",
      "Kërkesa u përgatit përmes faqes së gjimnazit.",
    ].join("\n");

    sendEmailLink.href = `mailto:v.prendushijop@yahoo.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }

  function buildPrintArea(application) {
    if (!printArea) return;

    const fullName = `${application.firstName} ${application.lastName}`.trim();
    const rows = [
      ["Numri i kërkesës", application.ref],
      ["Nxënësi", fullName],
      ["Datëlindja", formatDate(application.birthDate)],
      ["Klasa", `Klasa ${application.grade}`],
      ["Shkolla e mëparshme", application.previousSchool],
      ["Nota mesatare", application.gpa || "—"],
      ["Email", application.email],
      ["Telefoni", application.phone],
      ["Prindi / kujdestari", application.parentName],
      ["Telefoni i prindit", application.parentPhone],
      ["Mesazh", application.message || "—"],
      ["Data e kërkesës", formatDate(application.createdAt.slice(0, 10))],
    ];

    printArea.innerHTML = `
      <h1>Gjimnazi “Vinçenc Prendushi”</h1>
      <p class="print-sub">Rruga Taulantia, Durrës 2000 · +355 69 604 8464 · v.prendushijop@yahoo.com</p>
      <h2>Formulari i regjistrimit — Klasa ${escapeHtml(application.grade)}</h2>
      <table>
        <tbody>
          ${rows
            .map(
              ([label, value]) =>
                `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
      <p class="print-note">Ky dokument u përgatit nga faqja informuese e gjimnazit. Për finalizimin e regjistrimit, dorëzojeni në sekretari së bashku me dokumentet e kërkuara.</p>
      <div class="print-sign">
        <span>Nënshkrimi i prindit / kujdestarit</span>
        <span>Data</span>
      </div>
    `;
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearAllErrors();

      let firstInvalid = null;

      requiredFields.forEach((id) => {
        const isValid = validateField(id);
        if (!isValid && !firstInvalid) firstInvalid = document.getElementById(id);
      });

      const consentValid = validateConsent();
      if (!consentValid && !firstInvalid && consentInput) firstInvalid = consentInput;

      if (firstInvalid) {
        firstInvalid.focus({ preventScroll: true });
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const application = collectApplication();
      currentApplication = application;
      saveApplication(application);
      buildEmailLink(application);
      buildPrintArea(application);

      if (successName) successName.textContent = application.firstName;
      if (successRef) successRef.textContent = application.ref;

      form.hidden = true;
      if (successPanel) {
        successPanel.hidden = false;
        successPanel.scrollIntoView({ behavior: "smooth", block: "center" });
        const heading = $("h3", successPanel);
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus({ preventScroll: true });
        }
      }
    });
  }

  if (printButton) {
    printButton.addEventListener("click", () => {
      if (!currentApplication) return;
      buildPrintArea(currentApplication);
      window.print();
    });
  }

  if (newApplicationButton) {
    newApplicationButton.addEventListener("click", () => {
      if (!form) return;
      form.reset();
      currentApplication = null;
      clearAllErrors();
      if (successPanel) successPanel.hidden = true;
      form.hidden = false;
      const firstField = $("#firstName");
      if (firstField) firstField.focus();
    });
  }

  /* Initial state */
  onScroll();
})();
