import MapsPage from "../pages/maps.svelte";
import AuthPage from "../pages/auth.svelte";
import NotFoundPage from "../pages/404.svelte";

var routes = [
  {
    path: "/",
    component: MapsPage,
  },
  {
    path: "/auth",
    component: AuthPage,
  },
  {
    path: "(.*)",
    component: NotFoundPage,
  },
];

export default routes;
