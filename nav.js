/* Mobile navigation: full-screen menu toggled by the header button. */
(() => {
  const root = document.documentElement;
  const header = document.querySelector(".site-header");
  const button = header && header.querySelector(".nav-toggle");
  const nav = header && header.querySelector("#site-nav");
  if (!button || !nav) {
    root.classList.remove("has-nav-js");
    return;
  }

  const links = () => Array.from(nav.querySelectorAll("a"));

  const setOpen = (open, { focusButton = true } = {}) => {
    root.classList.toggle("nav-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.querySelector(".nav-toggle__label").textContent = open ? "Close" : "Menu";
    if (open) {
      const first = links()[0];
      if (first) first.focus({ preventScroll: true });
    } else if (focusButton) {
      button.focus({ preventScroll: true });
    }
  };

  button.addEventListener("click", () => setOpen(!root.classList.contains("nav-open")));

  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false, { focusButton: false });
  });

  document.addEventListener("keydown", (e) => {
    if (!root.classList.contains("nav-open")) return;
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key !== "Tab") return;
    // Keep focus inside the open menu (button + links).
    const items = [button, ...links()];
    const i = items.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) {
      e.preventDefault();
      items[items.length - 1].focus();
    } else if (!e.shiftKey && i === items.length - 1) {
      e.preventDefault();
      items[0].focus();
    }
  });

  // Close if the viewport grows past the mobile breakpoint.
  matchMedia("(min-width: 821px)").addEventListener("change", (e) => {
    if (e.matches) setOpen(false, { focusButton: false });
  });
})();
