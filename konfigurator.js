const configurator = document.querySelector("#cake-configurator");

if (configurator) {
  const summaryDetails = document.querySelector("#summary-details");
  const estimatedPrice = document.querySelector("#estimated-price");
  const characterCount = document.querySelector("#characters-remaining");
  const inscriptionInput = document.querySelector("#cake-inscription");
  const flavorSelect = document.querySelector("#cake-flavor");
  const previewCake = document.querySelector(".preview-cake");
  const previewBase = document.querySelector(".preview-base");
  const previewInscription = document.querySelector(".preview-inscription");
  const photoInput = document.querySelector("#cake-photo");
  const uploadStatus = document.querySelector("#upload-status");
  const addToCartButton = document.querySelector("#add-config-to-cart");
  const cartCount = document.querySelector(".cart-count");
  const cartButton = document.querySelector(".cart-button");

  const updateSummary = () => {
    const size = configurator.querySelector('input[name="size"]:checked');
    const color = configurator.querySelector('input[name="color"]:checked');
    const decorations = Array.from(configurator.querySelectorAll('input[name="decoration"]:checked'))
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
    estimatedPrice.textContent = `${estimatedPrice.dataset.price} €`;
    previewCake.dataset.color = color?.dataset.color ?? "rose";
    previewBase.textContent = flavorSelect.value;
    previewInscription.textContent = inscriptionInput.value.trim() || "BentoLab";
  };

  configurator.querySelectorAll(".config-choice").forEach((choice) => {
    choice.addEventListener("change", updateSummary);
  });

  inscriptionInput.addEventListener("input", () => {
    characterCount.textContent = String(inscriptionInput.maxLength - inscriptionInput.value.length);
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
      uploadStatus.textContent = "Vyberte JPG alebo PNG súbor do 10 MB.";
      photoInput.value = "";
      updateSummary();
      return;
    }

    uploadStatus.textContent = file.name;
    updateSummary();
  });

  addToCartButton.addEventListener("click", () => {
    const currentCount = Number.parseInt(cartCount.textContent ?? "", 10);
    if (!Number.isFinite(currentCount)) {
      console.error("Počet položiek v košíku nie je platné číslo.");
      return;
    }

    const nextCount = currentCount + 1;
    cartCount.textContent = String(nextCount);
    cartButton.setAttribute("aria-label", `Košík, položiek: ${nextCount}`);
  });

  updateSummary();
}
