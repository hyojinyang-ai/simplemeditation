import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const DYNAMIC_IMPORT_RELOAD_KEY = "stillness:dynamic-import-reload";

const recoverFromStaleChunk = async () => {
  if (sessionStorage.getItem(DYNAMIC_IMPORT_RELOAD_KEY) === "1") {
    return;
  }

  sessionStorage.setItem(DYNAMIC_IMPORT_RELOAD_KEY, "1");

  try {
    const registrations = await navigator.serviceWorker?.getRegistrations?.();
    await Promise.all(registrations?.map((registration) => registration.unregister()) ?? []);

    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    }
  } catch {
    // Best-effort recovery for stale production chunks.
  }

  window.location.reload();
};

const isDynamicImportFailure = (value: unknown) => {
  const message = value instanceof Error ? value.message : String(value);
  return (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Importing a module script failed") ||
    message.includes("Failed to load module script")
  );
};

window.addEventListener("error", (event) => {
  if (isDynamicImportFailure(event.error ?? event.message)) {
    void recoverFromStaleChunk();
  }
});

window.addEventListener("unhandledrejection", (event) => {
  if (isDynamicImportFailure(event.reason)) {
    void recoverFromStaleChunk();
  }
});

sessionStorage.removeItem(DYNAMIC_IMPORT_RELOAD_KEY);

createRoot(document.getElementById("root")!).render(<App />);
