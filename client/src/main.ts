
import { LoginPage } from "./components/login";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Root element #app not found");

new LoginPage().mount(app);
