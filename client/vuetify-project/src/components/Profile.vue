<template>
  <div>
    Your user profile is: <br /><br />{{
      jwtDecode(userStore.cognitoInfo.access_token)
    }}
  </div>
</template>

<script setup lang="ts">
import { jwtDecode } from "jwt-decode";
import { useUserStore } from "../stores/user";

const userStore = useUserStore();
</script>
