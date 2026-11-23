(() => {
  const storageKey = "bentolabCart";
  const cartButton = document.querySelector(".cart-button");

  if (!cartButton) {
    return;
  }

  let items = [];
  let previouslyFocusedElement = null;
  const addButtonLabels = new WeakMap();
  const addButtonTimers = new WeakMap();

  const overlay = document.createElement("div");
  overlay.className = "cart-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <button class="cart-backdrop" type="button" aria-label="Zavrieť košík"></button>
    <aside class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" tabindex="-1">
      <header class="cart-drawer-header">
        <h2 id="cart-title">Tvoj košík</h2>
        <button class="cart-close" type="button" aria-label="Zavrieť košík">×</button>
      </header>
      <div class="cart-drawer-content"></div>
    </aside>
  `;
  document.body.append(overlay);

  const drawer = overlay.querySelector(".cart-drawer");
  const content = overlay.querySelector(".cart-drawer-content");
  const badge = document.querySelector(".cart-count");

  const readCart = () => {
    try {
      const savedCart = localStorage.getItem(storageKey);
      if (!savedCart) {
        return [];
      }

      const parsedCart = JSON.parse(savedCart);
      if (!Array.isArray(parsedCart)) {
        console.error("Obsah košíka v úložisku nemá správny formát.");
        return [];
      }

      const validItems = parsedCart.filter((item) => (
        item
        && typeof item.id === "string"
        && typeof item.name === "string"
        && Number.isFinite(item.price)
        && item.price >= 0
        && Number.isInteger(item.quantity)
        && item.quantity > 0
      ));
      if (validItems.length !== parsedCart.length) {
        console.error("Niektoré položky košíka majú neplatné údaje a boli vynechané.");
      }
      return validItems;
    } catch (error) {
      console.error("Nepodarilo sa načítať košík z úložiska.", error);
      return [];
    }
  };

  const saveCart = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (error) {
      console.error("Nepodarilo sa uložiť košík.", error);
    }
    renderCart();
  };

  const formatPrice = (price) => `${price.toLocaleString("sk-SK")} €`;

  const updateBadge = () => {
    const quantity = items.reduce((total, item) => total + item.quantity, 0);
    badge.hidden = quantity === 0;
    badge.textContent = quantity === 0 ? "" : String(quantity);
    cartButton.setAttribute(
      "aria-label",
      quantity === 0 ? "Košík" : `Košík, položiek: ${quantity}`,
    );
  };

  const addItem = (item) => {
    const existingItem = items.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      items.push({ ...item, quantity: 1 });
    }
    saveCart();
  };

  const createActionButton = (label, action, itemId, className = "") => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.dataset.cartAction = action;
    button.dataset.itemId = itemId;
    button.setAttribute("aria-label", label);
    button.textContent = action === "increase" ? "+" : action === "decrease" ? "−" : "Odstrániť";
    return button;
  };

  const renderCart = () => {
    updateBadge();
    content.replaceChildren();

    if (items.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.className = "cart-empty";

      const message = document.createElement("p");
      message.textContent = "Košík je zatiaľ prázdny.";
      const offerLink = document.createElement("a");
      offerLink.className = "button button-primary";
      offerLink.href = "ponuka.html";
      offerLink.textContent = "Pozrieť ponuku";

      emptyState.append(message, offerLink);
      content.append(emptyState);
      return;
    }

    const list = document.createElement("ul");
    list.className = "cart-items";
    let total = 0;

    items.forEach((item) => {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;

      const listItem = document.createElement("li");
      listItem.className = "cart-item";
      const description = document.createElement("div");
      description.className = "cart-item-description";
      const name = document.createElement("h3");
      name.textContent = item.name;
      description.append(name);

      if (item.details) {
        const details = document.createElement("p");
        details.textContent = item.details;
        description.append(details);
      }

      const itemFooter = document.createElement("div");
      itemFooter.className = "cart-item-footer";
      const quantityControls = document.createElement("div");
      quantityControls.className = "cart-quantity";
      quantityControls.append(
        createActionButton(`Znížiť počet ${item.name}`, "decrease", item.id, "cart-quantity-button"),
      );
      const quantity = document.createElement("span");
      quantity.textContent = String(item.quantity);
      quantity.setAttribute("aria-label", `Počet: ${item.quantity}`);
      quantityControls.append(
        quantity,
        createActionButton(`Zvýšiť počet ${item.name}`, "increase", item.id, "cart-quantity-button"),
      );
      itemFooter.append(
        quantityControls,
        createActionButton(`Odstrániť ${item.name}`, "remove", item.id, "cart-remove"),
      );

      const price = document.createElement("p");
      price.className = "cart-item-price";
      price.textContent = formatPrice(lineTotal);
      listItem.append(description, itemFooter, price);
      list.append(listItem);
    });

    const summary = document.createElement("div");
    summary.className = "cart-summary";
    const totalLabel = document.createElement("span");
    totalLabel.textContent = "Spolu";
    const totalPrice = document.createElement("strong");
    totalPrice.textContent = formatPrice(total);
    summary.append(totalLabel, totalPrice);

    const checkoutLink = document.createElement("a");
    checkoutLink.className = "button button-primary cart-checkout";
    checkoutLink.href = "kontakt.html#formular";
    checkoutLink.textContent = "Pokračovať k objednávke →";
    content.append(list, summary, checkoutLink);
  };

  const openCart = () => {
    previouslyFocusedElement = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("cart-open");
    cartButton.setAttribute("aria-expanded", "true");
    drawer.focus();
    const closeButton = overlay.querySelector(".cart-close");
    closeButton.focus();
  };

  const closeCart = () => {
    overlay.hidden = true;
    document.body.classList.remove("cart-open");
    cartButton.setAttribute("aria-expanded", "false");
    if (previouslyFocusedElement instanceof HTMLElement) {
      previouslyFocusedElement.focus();
    }
  };

  cartButton.addEventListener("click", openCart);
  overlay.querySelector(".cart-close").addEventListener("click", closeCart);
  overlay.querySelector(".cart-backdrop").addEventListener("click", closeCart);

  overlay.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const actionButton = event.target.closest("[data-cart-action]");
    if (!actionButton) {
      return;
    }

    const itemIndex = items.findIndex((item) => item.id === actionButton.dataset.itemId);
    if (itemIndex < 0) {
      return;
    }

    const action = actionButton.dataset.cartAction;
    if (action === "remove" || (action === "decrease" && items[itemIndex].quantity === 1)) {
      items.splice(itemIndex, 1);
    } else if (action === "increase") {
      items[itemIndex].quantity += 1;
    } else if (action === "decrease") {
      items[itemIndex].quantity -= 1;
    } else {
      return;
    }
    saveCart();
  });

  document.addEventListener("keydown", (event) => {
    if (overlay.hidden) {
      return;
    }

    if (event.key === "Escape") {
      closeCart();
      return;
    }

    if (event.key === "Tab") {
      const focusableElements = Array.from(
        drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      ).filter((element) => element.offsetParent !== null);
      if (focusableElements.length === 0) {
        event.preventDefault();
        drawer.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const addButton = event.target.closest("[data-add-to-cart]");
    if (!addButton) {
      return;
    }

    event.preventDefault();
    const productCard = addButton.closest(".cake-card");
    const name = productCard?.querySelector(".cake-card-heading h2")?.textContent.trim();
    const priceText = productCard?.querySelector(".cake-price strong")?.textContent ?? "";
    const price = Number.parseFloat(priceText.replace(",", "."));
    if (!name || !Number.isFinite(price)) {
      console.error("Produkt košíka nemá platný názov alebo cenu.");
      return;
    }

    addItem({ id: `cake:${name}`, name, price });
    const originalLabel = addButtonLabels.get(addButton) ?? addButton.textContent.trim();
    addButtonLabels.set(addButton, originalLabel);
    window.clearTimeout(addButtonTimers.get(addButton));
    addButton.textContent = "Pridané ✓";
    addButtonTimers.set(addButton, window.setTimeout(() => {
      addButton.textContent = originalLabel;
      addButtonTimers.delete(addButton);
    }, 1600));
    openCart();
  });

  window.addEventListener("storage", (event) => {
    if (event.key === storageKey || event.key === null) {
      items = readCart();
      renderCart();
    }
  });

  window.BentoLabCart = {
    addConfiguration(configuration, shouldOpen = true) {
      const item = {
        id: `custom:${JSON.stringify(configuration)}`,
        name: `Torta na mieru (${configuration.size})`,
        price: Number(configuration.price),
        details: [
          configuration.flavor,
          configuration.color,
          configuration.decorations.length
            ? configuration.decorations.join(", ")
            : "bez dekorácie",
          configuration.inscription
            ? `Nápis: ${configuration.inscription}`
            : "bez nápisu",
        ].join(" · "),
      };

      if (!Number.isFinite(item.price) || item.price < 0) {
        console.error("Konfigurácia torty nemá platnú cenu.");
        return;
      }
      addItem(item);
      if (shouldOpen) {
        openCart();
      }
    },
  };

  items = readCart();
  renderCart();
})();
