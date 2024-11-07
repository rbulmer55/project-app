import {
  generatePKCETokens,
  getAuthorizationCode,
} from "@/services/login-service";
import { useUserStore } from "@/stores/user";

export function redirectToLogin(to: any, from: any, next: any) {
  const userStore = useUserStore();

  // get PKCE challenge and verifier for SPA
  generatePKCETokens().then((res) => {
    userStore.setPKCETokens(res.code_challenge, res.code_verifier);

    // redirect to cognito authorise endpoint
    const url = getAuthorizationCode(userStore.pkceChallenge);
    window.location.href = `${url}`;
  });
  next("/login");
}
