<template>
  <div style="padding: 10px 0px">
    <h2 class="text-h4 font-weight-black text-blue">Login</h2>

    <div class="text-h5 font-weight-light mb-2">
      Sign in to start recording engagements
    </div>

    <div class="d-flex flex-column">
      <v-sheet class="mx-auto" width="300">
        <v-btn class="mt-4" color="blue" block @click="$router.push('/login')">
          Login
        </v-btn>
      </v-sheet>
    </div>

    <!--
        <v-sheet class="mx-auto" width="300">
      <v-form ref="form">
        <v-text-field
          v-model="email"
          :rules="emailRules"
          label="Email"
          required
        ></v-text-field>

        <v-text-field
          v-model="password"
          :rules="passwordRules"
          label="Password"
          required
        ></v-text-field>

        <div class="d-flex flex-column">
          <v-btn class="mt-4" color="blue" block @click="login"> Login </v-btn>
        </div>
      </v-form>
    </v-sheet>
    -->
  </div>
</template>

<script lang="ts" setup></script>
