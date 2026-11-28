const configurator = document.querySelector("#cake-configurator");

if (configurator) {
  const summaryDetails = document.querySelector("#summary-details");
  const estimatedPrice = document.querySelector("#estimated-price");
  const characterCount = document.querySelector("#characters-written");
  const inscriptionInput = document.querySelector("#cake-inscription");
  const flavorSelect = document.querySelector("#cake-flavor");
  const previewImage = document.querySelector("#cake-preview-image");
  const previewInscription = document.querySelector("#preview-inscription");
  const previewSizeChip = document.querySelector("#preview-size-chip");
  const previewColorChip = document.querySelector("#preview-color-chip");
  const previewDecorationChip = document.querySelector("#preview-decoration-chip");
  const photoInput = document.querySelector("#cake-photo");
  const uploadStatus = document.querySelector("#upload-status");
  const addToCartButton = document.querySelector("#add-config-to-cart");
  let previewImageRequest = 0;
  let previewImageTransition;

  const updatePreviewImage = () => {
    const selectedFlavor = flavorSelect.selectedOptions[0];
    const imagePath = selectedFlavor.dataset.image;
    const imageAlt = `Torta s príchuťou ${selectedFlavor.textContent.trim()}`;
    const request = ++previewImageRequest;

    window.clearTimeout(previewImageTransition);

    if (previewImage.getAttribute("src") === imagePath) {
      previewImage.alt = imageAlt;
      previewImage.classList.remove("is-changing");
      return;
    }

    const imageToLoad = new Image();
    imageToLoad.onload = () => {
      if (request !== previewImageRequest) {
        return;
      }

      previewImage.classList.add("is-changing");
      previewImageTransition = window.setTimeout(() => {
        if (request !== previewImageRequest) {
          return;
        }

        previewImage.src = imagePath;
        previewImage.alt = imageAlt;
        window.requestAnimationFrame(() => {
          if (request === previewImageRequest) {
            previewImage.classList.remove("is-changing");
          }
        });
      }, 300);
    };
    imageToLoad.onerror = () => {
      if (request === previewImageRequest) {
        console.error(`Nepodarilo sa načítať fotografiu náhľadu: ${imagePath}`);
      }
    };
    imageToLoad.src = imagePath;
  };

  const updateSummary = () => {
    const size = configurator.querySelector('input[name="size"]:checked');
    const color = configurator.querySelector('input[name="color"]:checked');
    const selectedDecorations = Array.from(configurator.querySelectorAll('input[name="decoration"]:checked'));
    const decorations = selectedDecorations
      .map((option) => option.value);
    const details = [
      size?.value,
      flavorSelect.value,
      color?.value,
      ...decorations,
      inscriptionInput.value.trim() ? `Nápis: ${inscriptionInput.value.trim()}` : "",
      photoInput.files?.[0] ? "Fotografia nahratá" : "",
    ].filter(Boolean);

    summaryDetails.textContent = details.join(" · ");
    estimatedPrice.textContent = `${size?.dataset.price ?? estimatedPrice.dataset.price} €`;
    previewSizeChip.textContent = `Veľkosť: ${size?.value ?? "M"} · ${size?.dataset.portions ?? "10–12 porcií"}`;
    previewColorChip.textContent = `Farba: ${color?.value ?? "Karamelová"}`;
    previewDecorationChip.textContent = `Dekorácie: ${selectedDecorations.map((option) => option.value).join(", ") || "bez dekorácie"}`;
    previewInscription.textContent = inscriptionInput.value.trim();
    previewInscription.hidden = !inscriptionInput.value.trim();
    updatePreviewImage();
  };

  configurator.querySelectorAll(".config-choice").forEach((choice) => {
    choice.addEventListener("change", updateSummary);
  });

  inscriptionInput.addEventListener("input", () => {
    characterCount.textContent = String(inscriptionInput.value.length);
    updateSummary();
  });

  photoInput.addEventListener("change", () => {
    const file = photoInput.files?.[0];
    if (!file) {
      uploadStatus.textContent = "";
      updateSummary();
      return;
    }

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type) || file.size > 10 * 1024 * 1024) {
      uploadStatus.textContent = "Vyber JPG alebo PNG súbor do 10 MB.";
      photoInput.value = "";
      updateSummary();
      return;
    }

    uploadStatus.textContent = file.name;
    updateSummary();
  });

  addToCartButton.addEventListener("click", () => {
    const size = configurator.querySelector('input[name="size"]:checked');
    const flavor = flavorSelect.value;
    const color = configurator.querySelector('input[name="color"]:checked');
    const decorations = Array.from(
      configurator.querySelectorAll('input[name="decoration"]:checked'),
    ).map((option) => option.value);
    const inscription = inscriptionInput.value.trim();
    const price = size?.dataset.price ?? estimatedPrice.dataset.price;
    const configuration = {
      size: size?.value ?? "",
      flavor,
      color: color?.value ?? "",
      decorations,
      inscription,
      price,
    };

    try {
      sessionStorage.setItem("bentolabCakeConfiguration", JSON.stringify(configuration));
    } catch (error) {
      console.error("Nepodarilo sa uložiť konfiguráciu torty.", error);
    }

    if (!window.BentoLabCart) {
      console.error("Košík nie je načítaný.");
      return;
    }
    window.BentoLabCart.addConfiguration(configuration, false);
    window.location.href = "kontakt.html#formular";
  });

  characterCount.textContent = String(inscriptionInput.value.length);
  updateSummary();
}
