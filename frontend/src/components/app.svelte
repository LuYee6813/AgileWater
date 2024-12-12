<script lang="ts">
  import { onMount } from "svelte";

  import { f7, f7ready, App, View } from "framework7-svelte";

  import routes from "../js/routes";
  import store from "../js/store";
  import { type AppProps } from "framework7-svelte/components/app";

  // Framework7 Parameters
  let f7params: AppProps = {
    name: "Agile Water", // App name
    theme: "auto", // Automatic theme detection

    // App store
    store: store,
    // App routes
    routes: routes,
    // Register service worker (only on production build)
    serviceWorker:
      process.env.NODE_ENV === "production"
        ? {
            path: "/service-worker.js",
          }
        : {},

    // Automatic dark mode detection
    darkMode: "auto",

    view: {
      browserHistory: true,
      browserHistorySeparator: "",
    },
  };
  onMount(() => {
    f7ready(() => {
      // Call F7 APIs here
    });
  });
</script>

<App {...f7params}>
  <!-- Your main view, should have "view-main" class -->
  <View main class="safe-areas" url="/" />
</App>
