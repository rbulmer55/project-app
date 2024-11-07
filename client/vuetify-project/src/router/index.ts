/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from "vue-router/auto";
import {
  requireAuth,
  redirectToLogin,
  handleLoginResult,
  logout,
} from "./guards";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  //routes: setupLayouts(routes),
  routes: [
    {
      path: "/",
      component: () => import("../layouts/default.vue"),
      children: [
        {
          path: "/",
          name: "home",
          component: () => import("../pages/index.vue"),
        },
        {
          path: "/clients",
          name: "clients",
          component: () => import("../pages/clients.vue"),
        },
        {
          path: "/projects",
          name: "projects",
          component: () => import("../pages/projects.vue"),
        },
        {
          path: "/engagements",
          name: "engagements",
          component: () => import("../pages/engagements.vue"),
        },
        {
          path: "/summaries",
          name: "summaries",
          component: () => import("../pages/summaries.vue"),
        },
        {
          path: "/profile",
          name: "profile",
          component: () => import("../pages/profile.vue"),
          beforeEnter: requireAuth,
        },
        {
          path: "/login",
          name: "login",
          beforeEnter: redirectToLogin,
          component: () => import("../pages/index.vue"),
        },
        {
          // Authentication provider RedirectURI
          path: "/login/oauth2/code/cognito",
          beforeEnter: handleLoginResult,
          component: () => import("../pages/index.vue"),
        },
        {
          path: "/logout",
          beforeEnter: logout,
          component: () => import("../pages/index.vue"),
        },
      ],
    },
  ],
});

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.("Failed to fetch dynamically imported module")) {
    if (!localStorage.getItem("vuetify:dynamic-reload")) {
      console.log("Reloading page to fix dynamic import error");
      localStorage.setItem("vuetify:dynamic-reload", "true");
      location.assign(to.fullPath);
    } else {
      console.error("Dynamic import error, reloading page did not fix it", err);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem("vuetify:dynamic-reload");
});

export default router;
