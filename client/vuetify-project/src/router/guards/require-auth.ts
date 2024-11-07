import { useUserStore } from "@/stores/user";

export function requireAuth(to: any, from: any, next: any) {
  const userStore = useUserStore();
  if (!userStore.loggedIn || !userStore.cognitoInfo.access_token) {
    userStore.setLoggedOut();
    next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }
  next();
}
