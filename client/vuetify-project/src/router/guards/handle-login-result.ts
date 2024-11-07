import { getAccesstoken } from "@/services/login-service";
import { useUserStore } from "@/stores/user";

export function handleLoginResult(to: any, from: any, next: any) {
  const userStore = useUserStore();

  // store authorisation code from caller
  if (!to.query.code?.toString()) {
    next("/login");
  }
  const code = to.query.code?.toString() || "";

  console.log(userStore.pkceVerifier);
  // call cognito to retieve users
  getAccesstoken(code, userStore.pkceVerifier).then((res) => {
    if (res) {
      userStore.setCognitoInfo(res.data);
    }
  });

  next("/");
}
