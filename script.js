const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = themeToggle.querySelector(".theme-icon");
const themeLabel = themeToggle.querySelector(".theme-label");
const navbarLogo = document.querySelector(".site-header .logo img");
const year = document.querySelector("#year");
const siteHeader = document.querySelector(".site-header");

year.textContent = new Date().getFullYear();

function updateThemeButton(isDark) {
  themeIcon.textContent = isDark ? "☀" : "☾";
  themeLabel.textContent = isDark ? "Light" : "Dark";
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode"
  );
}

function updateNavbarLogo(isDark) {
  navbarLogo.src = isDark ? navbarLogo.dataset.darkSrc : navbarLogo.dataset.lightSrc;
}

const savedTheme = localStorage.getItem("portfolio-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const startInDarkMode = savedTheme ? savedTheme === "dark" : prefersDark;

document.body.classList.toggle("dark", startInDarkMode);
updateThemeButton(startInDarkMode);
updateNavbarLogo(startInDarkMode);

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
  updateThemeButton(isDark);
  updateNavbarLogo(isDark);
});

let previousScrollPosition = window.scrollY;
let scrollUpdatePending = false;
let scrollDirection = 0;
let accumulatedScrollDistance = 0;
let inactivityTimer;
const inactivityDelay = 7000;

function resetInactivityTimer() {
  window.clearTimeout(inactivityTimer);
  inactivityTimer = window.setTimeout(() => {
    siteHeader.classList.remove("is-hidden");
  }, inactivityDelay);
}

function updateHeaderVisibility() {
  const currentScrollPosition = Math.max(window.scrollY, 0);
  const scrollDistance = currentScrollPosition - previousScrollPosition;
  const currentDirection = Math.sign(scrollDistance);

  if (currentDirection && currentDirection !== scrollDirection) {
    scrollDirection = currentDirection;
    accumulatedScrollDistance = 0;
  }

  accumulatedScrollDistance += Math.abs(scrollDistance);

  if (currentScrollPosition <= 32) {
    siteHeader.classList.remove("is-hidden");
  } else if (scrollDirection > 0 && accumulatedScrollDistance > 8) {
    siteHeader.classList.add("is-hidden");
  } else if (scrollDirection < 0 && accumulatedScrollDistance > 8) {
    siteHeader.classList.remove("is-hidden");
  }

  previousScrollPosition = currentScrollPosition;
  scrollUpdatePending = false;
}

window.addEventListener(
  "scroll",
  () => {
    resetInactivityTimer();

    if (!scrollUpdatePending) {
      window.requestAnimationFrame(updateHeaderVisibility);
      scrollUpdatePending = true;
    }
  },
  { passive: true }
);

window.addEventListener("mousemove", resetInactivityTimer, { passive: true });
window.addEventListener("touchstart", resetInactivityTimer, { passive: true });

siteHeader.addEventListener("focusin", () => {
  siteHeader.classList.remove("is-hidden");
});
