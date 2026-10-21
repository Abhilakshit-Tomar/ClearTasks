import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import "@fontsource-variable/manrope";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/standard-italic.css";
import "@/index.css";
import App from "@/App";

const query = new URLSearchParams(location.search);
if (query.has("fixture"))
  sessionStorage.setItem(
    "studio-test-fixture",
    query.get("fixture") || "normal",
  );
if (query.has("case"))
  sessionStorage.setItem("studio-test-case", query.get("case") || "default");
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      storageKey="cleartasks-test-appearance"
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
