import axios from "axios";
import keycloak from "../auth/keycloak";

const api = axios.create({
  baseURL: "http://localhost:8083",
});

api.interceptors.request.use(
  async (config) => {
    if (keycloak.authenticated) {
      try {
        await keycloak.updateToken(30);

        config.headers.Authorization =
          `Bearer ${keycloak.token}`;
      } catch (error) {
        console.error(
          "Failed to refresh Keycloak token:",
          error
        );
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;