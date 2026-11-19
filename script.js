document.querySelectorAll(".newsletter").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
  });
});
