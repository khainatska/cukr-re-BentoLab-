const orderForm = document.querySelector("#formular");

if (orderForm) {
  const nameInput = document.querySelector("#meno-priezvisko");
  const emailInput = document.querySelector("#email");
  const phoneInput = document.querySelector("#telefon");
  const dateInput = document.querySelector("#termin");
  const noteInput = document.querySelector("#poznamka");
  const successMessage = document.querySelector("#form-success");

  const today = new Date();
  dateInput.min = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const fields = [
    { input: nameInput, errorId: "meno-priezvisko-error" },
    { input: emailInput, errorId: "email-error" },
    { input: phoneInput, errorId: "telefon-error" },
    { input: dateInput, errorId: "termin-error" },
  ];

  try {
    const savedConfiguration = sessionStorage.getItem("bentolabCakeConfiguration");
    if (savedConfiguration) {
      const configuration = JSON.parse(savedConfiguration);
      const decorations = Array.isArray(configuration.decorations)
        ? configuration.decorations.join(", ")
        : "";
      const inscription = configuration.inscription
        ? configuration.inscription
        : "bez nápisu";

      noteInput.value = [
        `Veľkosť: ${configuration.size}`,
        `príchuť: ${configuration.flavor}`,
        `farba: ${configuration.color}`,
        `dekorácie: ${decorations || "bez dekorácie"}`,
        `nápis: ${inscription}`,
        `orientačná cena: ${configuration.price} €`,
      ].join(", ");
    }
  } catch (error) {
    console.error("Nepodarilo sa načítať konfiguráciu torty.", error);
  }

  const setError = (field, message) => {
    const errorElement = document.querySelector(`#${field.errorId}`);
    field.input.classList.toggle("has-error", Boolean(message));
    field.input.setAttribute("aria-invalid", message ? "true" : "false");
    errorElement.textContent = message;
  };

  const validateName = () => {
    const valid = nameInput.value.trim().length > 0;
    setError(fields[0], valid ? "" : "Zadaj meno a priezvisko.");
    return valid;
  };

  const validateEmail = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailPattern.test(emailInput.value.trim());
    setError(fields[1], valid ? "" : "Zadaj platný e-mail.");
    return valid;
  };

  const validatePhone = () => {
    const digits = phoneInput.value.replace(/\D/g, "");
    const valid = digits.length >= 7;
    setError(fields[2], valid ? "" : "Zadaj platný telefón.");
    return valid;
  };

  const validateDate = () => {
    if (!dateInput.value) {
      setError(fields[3], "Vyber požadovaný termín.");
      return false;
    }

    const today = new Date();
    const localToday = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");
    const valid = dateInput.value >= localToday;
    setError(fields[3], valid ? "" : "Termín nemôže byť v minulosti.");
    return valid;
  };

  fields.forEach((field) => {
    field.input.addEventListener("input", () => {
      if (field.input.classList.contains("has-error")) {
        if (field.input === nameInput) validateName();
        if (field.input === emailInput) validateEmail();
        if (field.input === phoneInput) validatePhone();
        if (field.input === dateInput) validateDate();
      }
    });
  });

  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    successMessage.textContent = "";

    const valid = [
      validateName(),
      validateEmail(),
      validatePhone(),
      validateDate(),
    ].every(Boolean);

    if (!valid) {
      const firstInvalid = orderForm.querySelector(".has-error");
      firstInvalid?.focus();
      return;
    }

    orderForm.reset();
    fields.forEach((field) => setError(field, ""));
    successMessage.textContent = "Ďakujeme! Ozveme sa ti do 24 hodín.";
  });
}
