import { getLogoutUrl } from "@/services/login-service";
import { useUserStore } from "@/stores/user";

export async function logout(to: any, from: any, next: any) {
  const userStore = useUserStore();

  // clear user store
  userStore.setLoggedOut();

  //redirect to sign out of cognito
  const url = getLogoutUrl();

  await new Promise((resolve) => {
    window.location.href = `${url}`;
    setTimeout(() => {
      resolve("Waiting");
    }, 3000);
  });

  next("/logout");
}
