<template>
  <v-container>
    <v-row>
      <v-col>
        <v-sheet
          class="d-flex align-center justify-center flex-wrap text-center mx-auto px-4"
          elevation="4"
          max-width="800"
          width="100%"
          rounded
        >
          <div v-if="userStore.loggedIn">
            <LoggedIn />
          </div>
          <div v-else>
            <LoginForm />
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { useUserStore } from "../stores/user";
import LoginForm from "@/components/Login.vue";
import LoggedIn from "@/components/LoggedIn.vue";

const userStore = useUserStore();
</script>
