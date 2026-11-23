(() => {
  const searchContainer = document.querySelector(".search-container");
  const form = searchContainer?.querySelector(".search-box");
  const input = searchContainer?.querySelector('input[type="search"]');
  const listbox = searchContainer?.querySelector('[role="listbox"]');

  if (!searchContainer || !form || !input || !listbox) {
    return;
  }

  const cakes = [
    { name: "Čokoládová klasika", price: "25 €", image: "img/čokoladova_torta.png", href: "ponuka.html#cokoladova-klasika" },
    { name: "Ovocné pokušenie", price: "28 €", image: "img/Ovocné.pokušenie.png", href: "ponuka.html#ovocne-pokusenie" },
    { name: "Vanilkový obláčik", price: "25 €", image: "img/Vanilkový.obláčik.png", href: "ponuka.html#vanilkovy-oblacik" },
    { name: "Slaný karamel", price: "30 €", image: "img/Slaný_karamel.png", href: "ponuka.html#slany-karamel" },
    { name: "Pistáciový sen", price: "32 €", image: "img/pistaciovy-sen.png", href: "ponuka.html#pistaciovy-sen" },
    { name: "Lesné plody", price: "29 €", image: "img/Lesné.plody.png", href: "ponuka.html#lesne-plody" },
  ];
  const pages = [
    { name: "Domov", href: "index.html" },
    { name: "Ponuka tort", href: "ponuka.html" },
    { name: "Vytvor si tortu", href: "konfigurator.html" },
    { name: "Kontakt", href: "kontakt.html" },
  ].map((page) => ({ ...page, image: "img/favicon.svg" }));
  const items = [...cakes, ...pages];
  let matches = [];
  let activeIndex = -1;

  const normalize = (value) => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("sk")
    .trim();

  const cakeGrid = document.querySelector(".cake-grid");
  const searchFeedback = document.querySelector("#cake-search-feedback");
  if (cakeGrid && searchFeedback) {
    const rawQuery = new URLSearchParams(window.location.search).get("q") ?? "";
    const query = rawQuery.trim();

    if (query) {
      input.value = rawQuery;
      const normalizedQuery = normalize(query);
      const cards = Array.from(cakeGrid.querySelectorAll(".cake-card"));
      const matchingCards = cards.filter((card) => {
        const name = card.querySelector(".cake-card-heading h2")?.textContent ?? "";
        return normalize(name).includes(normalizedQuery);
      });

      cards.forEach((card) => {
        card.hidden = !matchingCards.includes(card);
      });
      cakeGrid.hidden = matchingCards.length === 0;
      searchFeedback.hidden = false;
      searchFeedback.replaceChildren();

      const message = document.createElement("p");
      if (matchingCards.length > 0) {
        searchFeedback.className = "cake-search-feedback cake-search-feedback-row";
        message.textContent = `Výsledky pre „${query}“`;

        const clearButton = document.createElement("button");
        clearButton.className = "cake-filter-clear";
        clearButton.type = "button";
        clearButton.textContent = "Zrušiť filter";
        clearButton.addEventListener("click", () => {
          window.location.href = "ponuka.html";
        });
        searchFeedback.append(message, clearButton);
      } else {
        searchFeedback.className = "cake-search-feedback cake-search-feedback-empty";
        message.textContent = "Nič sme nenašli. Skús iné slovo alebo si vytvor vlastnú tortu.";

        const createCakeLink = document.createElement("a");
        createCakeLink.className = "button button-primary";
        createCakeLink.href = "konfigurator.html";
        createCakeLink.textContent = "Vytvoriť tortu →";
        searchFeedback.append(message, createCakeLink);
      }
    }
  }

  const closeSuggestions = () => {
    listbox.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    activeIndex = -1;
  };

  const updateActiveOption = () => {
    const options = listbox.querySelectorAll('[role="option"]');
    options.forEach((option, index) => {
      const isActive = index === activeIndex;
      option.setAttribute("aria-selected", String(isActive));
      if (isActive) {
        input.setAttribute("aria-activedescendant", option.id);
      }
    });
  };

  const renderSuggestions = () => {
    const query = normalize(input.value);
    listbox.replaceChildren();
    activeIndex = -1;
    input.removeAttribute("aria-activedescendant");

    matches = query
      ? items.filter((item) => normalize(item.name).includes(query)).slice(0, 5)
      : [];

    if (matches.length === 0) {
      closeSuggestions();
      return;
    }

    matches.forEach((item, index) => {
      const option = document.createElement("a");
      option.className = "search-result";
      option.href = item.href;
      option.id = `search-option-${index}`;
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");

      const image = document.createElement("img");
      image.className = `search-result-image${item.price ? "" : " search-result-page-image"}`;
      image.src = item.image;
      image.alt = "";

      const copy = document.createElement("span");
      copy.className = "search-result-copy";
      const name = document.createElement("span");
      name.className = "search-result-name";
      name.textContent = item.name;
      copy.append(name);

      if (item.price) {
        const price = document.createElement("span");
        price.className = "search-result-price";
        price.textContent = item.price;
        copy.append(price);
      }

      option.append(image, copy);
      listbox.append(option);
    });

    listbox.hidden = false;
    input.setAttribute("aria-expanded", "true");
  };

  input.addEventListener("input", renderSuggestions);
  form.addEventListener("submit", (event) => {
    if (!input.value.trim()) {
      event.preventDefault();
      closeSuggestions();
    }
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!listbox.hidden) {
        event.preventDefault();
        closeSuggestions();
      }
      return;
    }

    if (matches.length === 0 || listbox.hidden) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % matches.length;
      updateActiveOption();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = activeIndex <= 0 ? matches.length - 1 : activeIndex - 1;
      updateActiveOption();
    } else if (event.key === "Enter") {
      if (activeIndex >= 0) {
        event.preventDefault();
        window.location.href = matches[activeIndex].href;
      }
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target instanceof Element && !searchContainer.contains(event.target)) {
      closeSuggestions();
    }
  });
})();
