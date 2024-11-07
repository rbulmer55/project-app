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
          <Profile />
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import Profile from "@/components/Profile.vue";
</script>
