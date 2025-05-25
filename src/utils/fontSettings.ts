
const FONT_CLASSES = [
  "font-roboto",
  "font-open-sans", 
  "font-lato",
  "font-playfair",
  "font-merriweather"
];

export const initializeFontSettings = () => {
  // Apply saved font family
  const savedFont = localStorage.getItem("app-font");
  if (savedFont && savedFont !== "system") {
    // Remove any existing font classes
    FONT_CLASSES.forEach(className => {
      document.documentElement.classList.remove(className);
    });
    
    // Add the saved font class
    const fontClass = `font-${savedFont}`;
    if (FONT_CLASSES.includes(fontClass)) {
      document.documentElement.classList.add(fontClass);
    }
  }

  // Apply saved font size
  const savedFontSize = localStorage.getItem("app-font-size");
  if (savedFontSize) {
    document.documentElement.style.fontSize = `${savedFontSize}px`;
  }
};
