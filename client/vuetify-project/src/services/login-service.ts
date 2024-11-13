import axios from "axios";
import pkceChallenge from "pkce-challenge";

const clientId = import.meta.env.VITE_APP_COGNITO_CLIENT_ID;
const appDomain = import.meta.env.VITE_APP_COGNITO_APP_DOMAIN;
const redirect = import.meta.env.VITE_APP_COGNITO_REDIRECT_URI;
const redirectSignout = import.meta.env.VITE_APP_COGNITO_REDIRECT_URI_SIGNOUT;

type PKCEResponse = {
  code_verifier: string;
  code_challenge: string;
};

export async function generatePKCETokens(): Promise<PKCEResponse> {
  return await pkceChallenge();
}

export function getAuthorizationCode(pkceChallenge: string) {
  return `${appDomain}/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirect}&state=1234&scope=email+openid+profile&code_challenge_method=S256&code_challenge=${pkceChallenge}`;
}

export function getLogoutUrl() {
  return `${appDomain}/logout?client_id=${clientId}&logout_uri=${redirectSignout}`;
}

export async function getAccesstoken(code: string, pkceVerifier: string) {
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("client_id", clientId);
  params.append("code", code);
  params.append("code_verifier", pkceVerifier);
  params.append("redirect_uri", redirect);

  const resp = await axios.post(`${appDomain}/oauth2/token`, params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return resp;
}
