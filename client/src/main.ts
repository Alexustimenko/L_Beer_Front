import { Router } from "./router/Router";
import { LoginPage } from "./components/login";
import { RegisterPage } from "./components/register";

const root = document.getElementById("app");

if (!root) throw new Error("Root element not found");

const router = new Router();

router.register("/login", () => {
    new LoginPage(path => router.navigate(path)).mount(root);
});

router.register("/register", () => {
    new RegisterPage(path => router.navigate(path)).mount(root);
});

if (window.location.pathname === "/") {
    router.navigate("/login");
} else {
    router.resolve();
}