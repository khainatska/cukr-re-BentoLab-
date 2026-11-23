(() => {
  const searchContainer = document.querySelector(".search-container");
  const input = searchContainer?.querySelector('input[type="search"]');
  const listbox = searchContainer?.querySelector('[role="listbox"]');

  if (!searchContainer || !input || !listbox) {
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
      event.preventDefault();
      const selectedIndex = activeIndex < 0 ? 0 : activeIndex;
      window.location.href = matches[selectedIndex].href;
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target instanceof Element && !searchContainer.contains(event.target)) {
      closeSuggestions();
    }
  });
})();
