import { getAccesstoken } from "@/services/login-service";
import { useUserStore } from "@/stores/user";

export async function handleLoginResult(to: any, from: any, next: any) {
  const userStore = useUserStore();

  // store authorisation code from caller
  if (!to.query.code?.toString()) {
    next("/login");
  }
  const code = to.query.code?.toString() || "";

  // call cognito to retieve users
  const res = await getAccesstoken(code, userStore.pkceVerifier);

  userStore.setCognitoInfo(res.data);

  next("/");
}
