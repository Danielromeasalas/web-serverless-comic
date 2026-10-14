const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#nav-links");

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Abrir menú" : "Cerrar menú");
  navLinks.classList.toggle("is-open", !isExpanded);
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    navLinks.classList.remove("is-open");
  });
});

const contactForm = document.querySelector("#contactForm");
const nombreInput = document.querySelector("#nombre");
const emailInput = document.querySelector("#email");
const formSuccess = document.querySelector("#formSuccess");

function setFieldError(input, message) {
  const error = document.querySelector(`#${input.id}Error`);
  error.textContent = message;
  input.setAttribute("aria-invalid", String(Boolean(message)));
  input.setAttribute("aria-describedby", error.id);
}

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formSuccess.hidden = true;

  const nombre = nombreInput.value.trim();
  const email = emailInput.value.trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  setFieldError(nombreInput, nombre ? "" : "Escribe tu nombre para continuar.");
  setFieldError(emailInput, !email ? "Escribe tu email para continuar." : validEmail ? "" : "Introduce un email válido.");

  if (!nombre || !validEmail) {
    contactForm.querySelector('[aria-invalid="true"]').focus();
    return;
  }

  formSuccess.textContent = `¡Gracias, ${nombre}! Tu mensaje se ha enviado correctamente. Nos pondremos en contacto contigo pronto.`;
  formSuccess.hidden = false;
  contactForm.reset();
  nombreInput.focus();
});

[nombreInput, emailInput].forEach((input) => {
  input.addEventListener("input", () => {
    if (input.getAttribute("aria-invalid") === "true") {
      setFieldError(input, "");
    }
  });
});
