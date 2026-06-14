import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { DataContextProvider } from "./contexts/dataContext.tsx";
import { FilterContextProvider } from "./contexts/filterContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DataContextProvider>
      <FilterContextProvider>
        <App />
      </FilterContextProvider>
    </DataContextProvider>
  </StrictMode>,
);
