import { create } from "zustand";
import keycloak from "../auth/keycloak";

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  email: string | null;
  roles: string[];
  token: string | null;

  setAuthentication: () => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  username: null,
  email: null,
  roles: [],
  token: null,

  setAuthentication: () => {
    const tokenParsed = keycloak.tokenParsed;

    set({
      isAuthenticated: true,
      username:
        tokenParsed?.preferred_username ?? null,
      email: tokenParsed?.email ?? null,
      roles:
        tokenParsed?.realm_access?.roles ?? [],
      token: keycloak.token ?? null,
    });
  },

  logout: () => {
    set({
      isAuthenticated: false,
      username: null,
      email: null,
      roles: [],
      token: null,
    });

    keycloak.logout({
      redirectUri: window.location.origin,
    });
  },
}));

export default useAuthStore;