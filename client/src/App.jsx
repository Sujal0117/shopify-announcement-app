/**
 * App Root
 * Wraps the application with Shopify App Bridge and Polaris providers.
 * Compatible with @shopify/app-bridge-react v4+ (Provider removed, use AppProvider).
 */
import React from "react";
import { AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import AnnouncementPage from "./pages/AnnouncementPage.jsx";
import "@shopify/polaris/build/esm/styles.css";

function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <AnnouncementPage />
    </AppProvider>
  );
}

export default App;
