import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router/router";

import keycloak from "./auth/keycloak";
import useAuthStore from "./stores/authStore";

useAuthStore.getState().setAuthentication();
console.log(
  "Auth state:",
  useAuthStore.getState()
);

keycloak
  .init({
    onLoad: "check-sso",
    pkceMethod: "S256",
  })
  .then((authenticated) => {
    if (authenticated) {
  useAuthStore.getState().setAuthentication();

  console.log("Keycloak authentication successful.");
  console.log(
    "Username:",
    keycloak.tokenParsed?.preferred_username
  );
  console.log("Token:", keycloak.token);
} else {
  console.log("User is not authenticated.");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
  })
  .catch((error) => {
    console.error(
      "Keycloak initialization failed:",
      error
    );
  });