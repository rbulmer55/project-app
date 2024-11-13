import {
  generatePKCETokens,
  getAuthorizationCode,
} from "@/services/login-service";
import { useUserStore } from "@/stores/user";

export async function redirectToLogin(to: any, from: any, next: any) {
  const userStore = useUserStore();
  try {
    // get PKCE challenge and verifier for SPA
    const res = await generatePKCETokens();
    userStore.setPKCETokens(res.code_challenge, res.code_verifier);

    // redirect to cognito authorise endpoint
    const url = getAuthorizationCode(userStore.pkceChallenge);

    await new Promise((resolve) => {
      window.location.href = `${url}`;
      setTimeout(() => {
        resolve("Waiting");
      }, 3000);
    });
  } catch (e) {
    console.error("Failed to generate PKCE tokens:", e);
    next("/login");
  }
}
