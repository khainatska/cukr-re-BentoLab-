(() => {
  const accountButton = document.querySelector(".account-button");
  if (!accountButton) {
    return;
  }

  const storageKey = "bentolabAccount";
  const dialog = document.createElement("dialog");
  dialog.className = "account-dialog";
  dialog.id = "account-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-label", "Tvoj účet");
  dialog.setAttribute("aria-modal", "true");
  dialog.tabIndex = -1;
  dialog.innerHTML = `
    <div class="account-dialog-header">
      <h2>Tvoj účet</h2>
      <button class="account-close" type="button" aria-label="Zavrieť">×</button>
    </div>
    <div class="account-tabs" role="tablist" aria-label="Možnosti účtu">
      <button id="account-login-tab" class="account-tab" type="button" role="tab" aria-selected="true" aria-controls="account-login-panel" tabindex="0">Prihlásenie</button>
      <button id="account-register-tab" class="account-tab" type="button" role="tab" aria-selected="false" aria-controls="account-register-panel" tabindex="-1">Registrácia</button>
    </div>
    <section id="account-login-panel" class="account-panel" role="tabpanel" aria-labelledby="account-login-tab">
      <p class="account-note">Ukážkový účet, údaje ostávajú len v tvojom prehliadači.</p>
      <p class="account-note account-demo-note">Prihlásenie je len ukážkové; heslo sa neukladá ani neoveruje.</p>
      <form class="account-form" data-account-form="login" novalidate>
        <div class="form-field account-field">
          <label for="account-login-email">E-mail</label>
          <input id="account-login-email" name="email" type="email" autocomplete="email" required aria-describedby="account-login-email-error" aria-invalid="false">
          <p id="account-login-email-error" class="field-error account-field-error" hidden></p>
        </div>
        <div class="form-field account-field">
          <label for="account-login-password">Heslo</label>
          <input id="account-login-password" name="password" type="password" autocomplete="current-password" required aria-describedby="account-login-password-error" aria-invalid="false">
          <p id="account-login-password-error" class="field-error account-field-error" hidden></p>
        </div>
        <p class="account-feedback" role="status" aria-live="polite" hidden></p>
        <button class="button button-primary account-submit" type="submit">Prihlásiť sa</button>
      </form>
    </section>
    <section id="account-register-panel" class="account-panel" role="tabpanel" aria-labelledby="account-register-tab" hidden>
      <p class="account-note">Ukážkový účet, údaje ostávajú len v tvojom prehliadači.</p>
      <form class="account-form" data-account-form="register" novalidate>
        <div class="form-field account-field">
          <label for="account-register-name">Meno</label>
          <input id="account-register-name" name="name" type="text" autocomplete="name" required aria-describedby="account-register-name-error" aria-invalid="false">
          <p id="account-register-name-error" class="field-error account-field-error" hidden></p>
        </div>
        <div class="form-field account-field">
          <label for="account-register-email">E-mail</label>
          <input id="account-register-email" name="email" type="email" autocomplete="email" required aria-describedby="account-register-email-error" aria-invalid="false">
          <p id="account-register-email-error" class="field-error account-field-error" hidden></p>
        </div>
        <div class="form-field account-field">
          <label for="account-register-password">Heslo</label>
          <input id="account-register-password" name="password" type="password" autocomplete="new-password" required minlength="6" aria-describedby="account-register-password-error" aria-invalid="false">
          <p id="account-register-password-error" class="field-error account-field-error" hidden></p>
        </div>
        <p class="account-feedback" role="status" aria-live="polite" hidden></p>
        <button class="button button-primary account-submit" type="submit">Vytvoriť účet</button>
      </form>
    </section>
  `;
  document.body.append(dialog);

  const tabButtons = Array.from(dialog.querySelectorAll('[role="tab"]'));
  const panels = Array.from(dialog.querySelectorAll('[role="tabpanel"]'));
  const closeButton = dialog.querySelector(".account-close");

  const setActiveTab = (tab) => {
    tabButtons.forEach((button) => {
      const isActive = button === tab;
      button.setAttribute("aria-selected", String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.id !== tab.getAttribute("aria-controls");
    });
  };

  const getFieldError = (field, formType) => {
    const value = field.value.trim();

    if (field.required && !value) {
      return "Toto pole je povinné.";
    }

    if (field.type === "email" && !field.validity.valid) {
      return "Zadaj platnú e-mailovú adresu.";
    }

    if (formType === "register" && field.name === "password" && Array.from(field.value).length < 6) {
      return "Heslo musí mať aspoň 6 znakov.";
    }

    return "";
  };

  const showFieldError = (field, formType) => {
    const error = dialog.querySelector(`#${field.id}-error`);
    const message = getFieldError(field, formType);
    field.classList.toggle("has-error", Boolean(message));
    field.setAttribute("aria-invalid", String(Boolean(message)));
    error.textContent = message;
    error.hidden = !message;
    return !message;
  };

  const setFeedback = (form, message, isError = false) => {
    const feedback = form.querySelector(".account-feedback");
    feedback.textContent = message;
    feedback.classList.toggle("is-error", isError);
    feedback.hidden = !message;
  };

  dialog.querySelectorAll(".account-form").forEach((form) => {
    const formType = form.dataset.accountForm;
    const fields = Array.from(form.querySelectorAll("input"));

    fields.forEach((field) => {
      field.addEventListener("blur", () => {
        field.dataset.validated = "true";
        showFieldError(field, formType);
      });

      field.addEventListener("input", () => {
        if (field.dataset.validated === "true") {
          showFieldError(field, formType);
        }
        setFeedback(form, "");
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const invalidFields = fields.filter((field) => {
        field.dataset.validated = "true";
        return !showFieldError(field, formType);
      });

      if (invalidFields.length > 0) {
        setFeedback(form, "");
        invalidFields[0].focus();
        return;
      }

      const email = form.elements.email.value.trim().toLocaleLowerCase("sk");

      if (formType === "register") {
        const name = form.elements.name.value.trim();
        try {
          localStorage.setItem(storageKey, JSON.stringify({ name, email }));
          form.reset();
          fields.forEach((field) => {
            delete field.dataset.validated;
            field.classList.remove("has-error");
            field.setAttribute("aria-invalid", "false");
            dialog.querySelector(`#${field.id}-error`).hidden = true;
          });
          setFeedback(form, `Účet je pripravený, ${name}. Meno a e-mail sa uložili v tomto prehliadači.`);
        } catch (error) {
          console.error("Nepodarilo sa uložiť ukážkový účet.", error);
          setFeedback(form, "Účet sa nepodarilo uložiť. Skontroluj nastavenia prehliadača a skús to znova.", true);
        }
        return;
      }

      try {
        const savedAccount = localStorage.getItem(storageKey);
        if (!savedAccount) {
          setFeedback(form, "Ukážkový účet s týmto e-mailom sa nenašiel. Najprv sa zaregistruj.", true);
          return;
        }

        const account = JSON.parse(savedAccount);
        if (
          !account
          || typeof account.name !== "string"
          || typeof account.email !== "string"
        ) {
          throw new Error("Uložené údaje ukážkového účtu nemajú správny formát.");
        }

        if (account.email.toLocaleLowerCase("sk") !== email) {
          setFeedback(form, "Ukážkový účet s týmto e-mailom sa nenašiel. Najprv sa zaregistruj.", true);
          return;
        }

        form.reset();
        fields.forEach((field) => {
          delete field.dataset.validated;
          field.classList.remove("has-error");
          field.setAttribute("aria-invalid", "false");
          dialog.querySelector(`#${field.id}-error`).hidden = true;
        });
        setFeedback(form, `Ahoj, ${account.name}! Toto bolo len ukážkové prihlásenie.`);
      } catch (error) {
        console.error("Nepodarilo sa načítať ukážkový účet.", error);
        setFeedback(form, "Údaje účtu sa nepodarilo načítať. Skús to znova.", true);
      }
    });
  });

  tabButtons.forEach((tab, index) => {
    tab.addEventListener("click", () => setActiveTab(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowRight") {
        nextIndex = (index + 1) % tabButtons.length;
      } else if (event.key === "ArrowLeft") {
        nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = tabButtons.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      setActiveTab(tabButtons[nextIndex]);
      tabButtons[nextIndex].focus();
    });
  });

  const closeDialog = () => {
    if (dialog.open) {
      dialog.close();
    }
  };

  accountButton.setAttribute("aria-controls", dialog.id);
  accountButton.setAttribute("aria-expanded", "false");
  accountButton.addEventListener("click", () => {
    if (dialog.open) {
      closeDialog();
      return;
    }

    dialog.showModal();
    accountButton.setAttribute("aria-expanded", "true");
    dialog.querySelector('[role="tabpanel"]:not([hidden]) input').focus();
  });
  closeButton.addEventListener("click", closeDialog);
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) {
      return;
    }

    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left
      || event.clientX > bounds.right
      || event.clientY < bounds.top
      || event.clientY > bounds.bottom
    ) {
      closeDialog();
    }
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog();
  });
  dialog.addEventListener("close", () => {
    accountButton.setAttribute("aria-expanded", "false");
    accountButton.focus();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") {
      return;
    }

    const focusable = Array.from(
      dialog.querySelectorAll('button:not([disabled]):not([tabindex="-1"]), input:not([disabled])'),
    ).filter((element) => element.getClientRects().length > 0);

    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  });
})();
