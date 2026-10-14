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
const submitBtn = document.querySelector("#submitBtn");
const formMessage = document.querySelector("#formMessage");
const apiUrl = "https://0q6yhdh7ve.execute-api.us-east-1.amazonaws.com/contacto";

function setFieldError(input, message) {
  const error = document.querySelector(`#${input.id}Error`);
  error.textContent = message;
  input.setAttribute("aria-invalid", String(Boolean(message)));
  input.setAttribute("aria-describedby", error.id);
}

function showMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = `form-message ${type}`;
  formMessage.hidden = false;
}

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.hidden = true;

  const nombre = nombreInput.value.trim();
  const email = emailInput.value.trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  setFieldError(nombreInput, nombre ? "" : "Escribe tu nombre para continuar.");
  setFieldError(emailInput, !email ? "Escribe tu email para continuar." : validEmail ? "" : "Introduce un email válido.");

  if (!nombre || !validEmail) {
    contactForm.querySelector('[aria-invalid="true"]').focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.setAttribute("aria-busy", "true");
  submitBtn.textContent = "Procesando entrada...";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email }),
    });

    if (!response.ok) {
      throw new Error(`La API respondió con estado ${response.status}.`);
    }

    contactForm.reset();
    setFieldError(nombreInput, "");
    setFieldError(emailInput, "");
    showMessage(`¡BAM, ${nombre}! Tu registro está en marcha. Pronto recibirás noticias de Viñeta Fest.`, "success");
    nombreInput.focus();
  } catch (error) {
    console.error("No se pudo completar el registro en Viñeta Fest.", error);
    showMessage("¡Ups! No hemos podido procesar tu entrada. Comprueba tu conexión e inténtalo de nuevo.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.removeAttribute("aria-busy");
    submitBtn.innerHTML = '¡Apúntame! <span aria-hidden="true">➜</span>';
  }
});

[nombreInput, emailInput].forEach((input) => {
  input.addEventListener("input", () => {
    if (input.getAttribute("aria-invalid") === "true") {
      setFieldError(input, "");
    }
  });
});
