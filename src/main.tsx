
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize font settings before rendering
const initializeFonts = async () => {
  try {
    const { initializeFontSettings } = await import("./utils/fontSettings");
    initializeFontSettings();
  } catch (error) {
    console.warn("Font settings initialization failed:", error);
  }
};

// Initialize fonts and render app
initializeFonts().then(() => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
