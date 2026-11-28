const configurator = document.querySelector("#cake-configurator");

if (configurator) {
  const summaryDetails = document.querySelector("#summary-details");
  const estimatedPrice = document.querySelector("#estimated-price");
  const characterCount = document.querySelector("#characters-written");
  const inscriptionInput = document.querySelector("#cake-inscription");
  const wishesInput = document.querySelector("#cake-wishes");
  const wishesCount = document.querySelector("#wishes-count");
  const flavorSelect = document.querySelector("#cake-flavor");
  const cakeIllustration = document.querySelector("#cake-illustration");
  const cakeArt = cakeIllustration.querySelector(".cake-art");
  const cakeInscriptionText = document.querySelector("#cake-inscription-text");
  const previewSizeChip = document.querySelector("#preview-size-chip");
  const previewColorChip = document.querySelector("#preview-color-chip");
  const previewDecorationChip = document.querySelector("#preview-decoration-chip");
  const photoInput = document.querySelector("#cake-photo");
  const uploadControl = document.querySelector(".upload-control");
  const uploadPreview = document.querySelector("#upload-preview");
  const uploadPreviewImage = document.querySelector("#upload-preview-image");
  const uploadFileName = document.querySelector("#upload-file-name");
  const uploadFileSize = document.querySelector("#upload-file-size");
  const uploadStatus = document.querySelector("#upload-status");
  const changePhotoButton = document.querySelector("#change-photo");
  const removePhotoButton = document.querySelector("#remove-photo");
  const addToCartButton = document.querySelector("#add-config-to-cart");
  let selectedPhoto = null;
  let photoPreviewUrl = "";

  const truncateText = (text, maxLength = 80) => (
    text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text
  );

  const formatFileSize = (bytes) => (
    bytes >= 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toLocaleString("sk-SK", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MB`
      : `${Math.max(1, Math.round(bytes / 1024)).toLocaleString("sk-SK")} kB`
  );

  const updateSummary = () => {
    const size = configurator.querySelector('input[name="size"]:checked');
    const color = configurator.querySelector('input[name="color"]:checked');
    const selectedDecorations = Array.from(configurator.querySelectorAll('input[name="decoration"]:checked'));
    const decorations = selectedDecorations
      .map((option) => option.value);
    const flavor = flavorSelect.value;
    const cream = color?.value ?? "Karamelová";
    const inscription = inscriptionInput.value.trim().slice(0, 32);
    const wishes = wishesInput.value.trim();
    const selectedDecorationNames = selectedDecorations.map((option) => option.value);
    const details = [
      size?.value,
      flavorSelect.value,
      color?.value,
      ...decorations,
      inscription ? `Nápis: ${inscription}` : "",
    ].filter(Boolean);

    const summaryText = details.join(" · ");
    summaryDetails.textContent = [
      summaryText,
      selectedPhoto ? `Fotografia: ${truncateText(selectedPhoto.name, 40)}` : "",
      wishes ? `Želania: ${truncateText(wishes)}` : "",
    ].filter(Boolean).join("\n");
    estimatedPrice.textContent = `${size?.dataset.price ?? estimatedPrice.dataset.price} €`;
    previewSizeChip.textContent = `Veľkosť: ${size?.value ?? "M"} · ${size?.dataset.portions ?? "10–12 porcií"}`;
    previewColorChip.textContent = `Farba: ${cream}`;
    previewDecorationChip.textContent = `Dekorácie: ${selectedDecorationNames.join(", ") || "bez dekorácie"}`;
    cakeIllustration.dataset.size = size?.value ?? "M";
    cakeArt.dataset.size = size?.value ?? "M";
    cakeIllustration.dataset.cream = cream;
    cakeIllustration.dataset.flavor = flavor;
    cakeIllustration.dataset.hasFlowers = String(selectedDecorationNames.includes("Kvety"));
    cakeIllustration.dataset.hasPearls = String(selectedDecorationNames.includes("Perličky"));
    cakeIllustration.dataset.hasBow = String(selectedDecorationNames.includes("Mašľa"));
    cakeIllustration.dataset.hasInscription = String(Boolean(inscription));
    cakeInscriptionText.textContent = inscription;
    cakeInscriptionText.setAttribute(
      "font-size",
      String(Math.max(11, 17 - Math.max(0, inscription.length - 16) * 0.45)),
    );
    if (inscription.length > 24) {
      cakeInscriptionText.setAttribute("textLength", "176");
      cakeInscriptionText.setAttribute("lengthAdjust", "spacingAndGlyphs");
    } else {
      cakeInscriptionText.removeAttribute("textLength");
      cakeInscriptionText.removeAttribute("lengthAdjust");
    }
    const decorationDescription = selectedDecorationNames.length
      ? ` Dekorácie: ${selectedDecorationNames.join(", ")}.`
      : "";
    const inscriptionDescription = inscription ? ` Nápis: ${inscription}.` : "";
    cakeIllustration.setAttribute(
      "aria-label",
      `Ilustrácia torty veľkosti ${size?.value ?? "M"} s krémom ${cream} a príchuťou ${flavor}.${decorationDescription}${inscriptionDescription}`,
    );
  };

  const selectPhoto = (file) => {
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type) || file.size > 10 * 1024 * 1024) {
      photoInput.value = "";
      uploadStatus.textContent = "Vyber JPG alebo PNG do 10 MB.";
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    photoPreviewUrl = nextPreviewUrl;
    selectedPhoto = file;
    uploadPreviewImage.src = photoPreviewUrl;
    uploadFileName.textContent = file.name;
    uploadFileName.title = file.name;
    uploadFileSize.textContent = formatFileSize(file.size);
    uploadStatus.textContent = "";
    uploadControl.hidden = true;
    uploadPreview.hidden = false;
    photoInput.value = "";
    updateSummary();
  };

  const dropTargets = [uploadControl, uploadPreview];
  let dragDepth = 0;
  const clearDragState = () => {
    dragDepth = 0;
    dropTargets.forEach((target) => target.classList.remove("is-drag-over"));
  };

  dropTargets.forEach((target) => {
    target.addEventListener("dragenter", (event) => {
      if (!Array.from(event.dataTransfer?.types ?? []).includes("Files")) {
        return;
      }
      event.preventDefault();
      dragDepth += 1;
      target.classList.add("is-drag-over");
    });

    target.addEventListener("dragover", (event) => {
      if (!Array.from(event.dataTransfer?.types ?? []).includes("Files")) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    });

    target.addEventListener("dragleave", (event) => {
      if (!Array.from(event.dataTransfer?.types ?? []).includes("Files")) {
        return;
      }
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) {
        clearDragState();
      }
    });

    target.addEventListener("drop", (event) => {
      if (!Array.from(event.dataTransfer?.types ?? []).includes("Files")) {
        return;
      }
      event.preventDefault();
      clearDragState();
      const file = event.dataTransfer.files?.[0];
      if (file) {
        selectPhoto(file);
      }
    });
  });

  configurator.querySelectorAll(".config-choice").forEach((choice) => {
    choice.addEventListener("change", updateSummary);
  });

  inscriptionInput.addEventListener("input", () => {
    characterCount.textContent = String(inscriptionInput.value.length);
    updateSummary();
  });

  wishesInput.addEventListener("input", () => {
    wishesCount.textContent = String(wishesInput.value.length);
    updateSummary();
  });

  photoInput.addEventListener("change", () => {
    const file = photoInput.files?.[0];
    if (file) {
      selectPhoto(file);
    }
  });

  changePhotoButton.addEventListener("click", () => {
    photoInput.value = "";
    photoInput.click();
  });

  removePhotoButton.addEventListener("click", () => {
    selectedPhoto = null;
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
      photoPreviewUrl = "";
    }
    uploadPreviewImage.removeAttribute("src");
    uploadFileName.textContent = "";
    uploadFileSize.textContent = "";
    uploadPreview.hidden = true;
    uploadControl.hidden = false;
    uploadStatus.textContent = "";
    photoInput.value = "";
    updateSummary();
  });

  addToCartButton.addEventListener("click", () => {
    const size = configurator.querySelector('input[name="size"]:checked');
    const flavor = flavorSelect.value;
    const color = configurator.querySelector('input[name="color"]:checked');
    const decorations = Array.from(
      configurator.querySelectorAll('input[name="decoration"]:checked'),
    ).map((option) => option.value);
    const inscription = inscriptionInput.value.trim().slice(0, 32);
    const wishes = wishesInput.value.trim();
    const photoName = selectedPhoto?.name ?? "";
    const price = size?.dataset.price ?? estimatedPrice.dataset.price;
    const configuration = {
      size: size?.value ?? "",
      flavor,
      color: color?.value ?? "",
      decorations,
      inscription,
      wishes,
      photoName,
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
  wishesCount.textContent = String(wishesInput.value.length);
  updateSummary();
}
