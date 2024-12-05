import MapsPage from "../pages/maps.svelte";
import NotFoundPage from "../pages/404.svelte";

var routes = [
  {
    path: "/",
    component: MapsPage,
  },
  {
    path: "(.*)",
    component: NotFoundPage,
  },
];

export default routes;
