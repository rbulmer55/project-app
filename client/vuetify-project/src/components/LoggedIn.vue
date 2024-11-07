<template>
  <div style="padding: 10px 0px">
    <h2 class="text-h4 font-weight-black text-blue">Welcome Back!</h2>

    <div class="text-h5 font-weight-light mb-2">
      Choose from the navigation options below
    </div>

    <div class="d-flex flex-column">
      <v-sheet class="mx-auto" max-width="300">
        <v-list density="compact">
          <v-list-subheader>ENGAGEMENTS</v-list-subheader>

          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :value="item"
            link
            @click="$router.push(item.route)"
            color="primary"
          >
            <template v-slot:prepend>
              <v-icon :icon="item.icon"></v-icon>
            </template>

            <v-list-item-title v-text="item.text"></v-list-item-title>
          </v-list-item>
        </v-list>
      </v-sheet>
    </div>
  </div>
</template>

<script lang="ts" setup></script>
<script lang="ts">
export default {
  data: () => ({
    items: [
      { text: "Engagements", icon: "mdi-clock", route: "/engagements" },
      { text: "Clients", icon: "mdi-account", route: "/clients" },
      { text: "Projects", icon: "mdi-flag", route: "/projects" },
      { text: "Summaries", icon: "mdi-book-multiple", route: "/summaries" },
      { text: "Profile", icon: "mdi-cog", route: "/profile" },
    ],
  }),
};
</script>
