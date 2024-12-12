import MapsPage from "../pages/maps.svelte";
import LoginPage from "../pages/login.svelte";
import NotFoundPage from "../pages/404.svelte";
import RegisterPage from "../pages/register.svelte";
import ProfilePage from "../pages/profile.svelte";

const routes = [
  {
    path: "/",
    component: MapsPage,
  },
  {
    path: "/profile",
    component: ProfilePage,
  },
  {
    path: "/login",
    component: LoginPage,
  },
  {
    path: "/register",
    component: RegisterPage,
  },
  {
    path: "(.*)",
    component: NotFoundPage,
  },
];

export default routes;
