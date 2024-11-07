<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<!-- eslint-disable vue/script-indent -->
<style>
.v-toolbar__prepend {
  display: contents;
}
</style>

<template>
  <v-app-bar height="96">
    <template #prepend>
      <v-img
        class="mx-2"
        contain
        max-height="40"
        max-width="40"
        src="@/assets/logo.svg"
      />

      <v-app-bar-title class="text-no-wrap">{{ title }}</v-app-bar-title>
    </template>
    <template #append>
      <v-btn append-icon="mdi-menu">
        Menu

        <v-menu activator="parent">
          <v-list>
            <v-list-item link @click="$router.push('/')" title="home" />
            <v-list-item
              v-if="!userStore.loggedIn"
              link
              @click="$router.push('/login')"
              title="Login"
            />
            <v-list-item
              link
              @click="$router.push('/clients')"
              title="Clients"
            />
            <v-list-item
              link
              @click="$router.push('/projects')"
              title="Projects"
            />
            <v-list-item
              link
              @click="$router.push('/engagements')"
              title="Engagements"
            />
            <v-list-item
              link
              @click="$router.push('/summaries')"
              title="Summaries"
            />
            <v-list-item
              v-if="userStore.loggedIn"
              link
              @click="$router.push('/profile')"
              title="Profile"
            />
            <v-list-item
              v-if="userStore.loggedIn"
              link
              @click="$router.push('/logout')"
              title="Logout"
            />
          </v-list>
        </v-menu>
      </v-btn>
    </template>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>
