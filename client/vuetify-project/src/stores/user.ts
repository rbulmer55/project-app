// Utilities
import { ref } from "vue";
import { defineStore } from "pinia";

type CognitoInfo = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

const EmptyCognitoObject = {
  access_token: "",
  expires_in: 0,
  token_type: "",
};

export const useUserStore = defineStore(
  "user",
  () => {
    const cognitoInfo = ref(EmptyCognitoObject);
    const loggedIn = ref(false);
    const pkceChallenge = ref("");
    const pkceVerifier = ref("");
    const mfaSession = ref("");
    const mfaCode = ref("");
    const optSecret = ref("");
    const optSession = ref("");
    const optCode = ref("");

    function setOTPCode(code: string) {
      optCode.value = code;
    }

    function setOTPdetails(secret: string, session: string) {
      optSecret.value = secret;
      optSession.value = session;
    }

    function setMFASession(session: string) {
      mfaSession.value = session;
    }

    function setMFACode(code: string) {
      mfaCode.value = code;
    }

    function setPKCETokens(challenge: string, verifier: string): void {
      pkceChallenge.value = challenge;
      pkceVerifier.value = verifier;
    }

    function clearPKCETokens() {
      pkceChallenge.value = "";
      pkceVerifier.value = "";
    }

    function setLoggedOut(): void {
      //reset logged in
      loggedIn.value = false;
      //reset token values
      cognitoInfo.value.access_token = "";
      cognitoInfo.value.expires_in = 0;
      cognitoInfo.value.token_type = "";
      //clear pcke values
      clearPKCETokens();
    }

    function setCognitoInfo({
      access_token,
      token_type,
      expires_in,
    }: CognitoInfo): void {
      //set logged in
      loggedIn.value = true;
      //set token values
      cognitoInfo.value.access_token = access_token;
      cognitoInfo.value.expires_in = expires_in;
      cognitoInfo.value.token_type = token_type;
      //clear pcke values
      clearPKCETokens();
    }

    return {
      cognitoInfo,
      loggedIn,
      pkceChallenge,
      pkceVerifier,
      mfaSession,
      mfaCode,
      optSecret,
      optSession,
      optCode,
      setLoggedOut,
      setCognitoInfo,
      setPKCETokens,
      setMFASession,
      setMFACode,
      setOTPdetails,
      setOTPCode,
    };
  },
  { persist: true },
);
