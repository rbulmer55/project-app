import { getLogoutUrl } from "@/services/login-service";
import { useUserStore } from "@/stores/user";

export function logout(to: any, from: any, next: any) {
  const userStore = useUserStore();

  // clear user store
  userStore.setLoggedOut();

  //redirect to sign out of cognito
  const url = getLogoutUrl();
  window.location.href = `${url}`;
  next("/logout");
}
