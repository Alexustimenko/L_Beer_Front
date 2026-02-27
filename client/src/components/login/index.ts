import "./style.css";

type LoginMode = "email" | "phone";

export class LoginPage {
    private mode: LoginMode = "email";
    private navigate: (path: string) => void;

    constructor(navigate: (path: string) => void) {
        this.navigate = navigate;
    }

    mount(root: HTMLElement): void {
        root.innerHTML = `
        <div class="auth-bg">
            <div class="auth-card">

                <h1>🍺 Oktober Shop</h1>
                <p class="subtitle">Beer delivery for Oktoberfest</p>

                <div class="switch">
                    <button data-mode="phone">Phone</button>
                    <button data-mode="email" class="active">Email</button>
                </div>

                <input id="loginInput" placeholder="Email" />
                <input type="password" placeholder="Password"/>

                <button class="primary">Login</button>

                <span class="link-switch" id="goRegister">
                    Don't have an account? Register
                </span>

            </div>
        </div>
        `;

        this.bind(root);
    }

    private bind(root: HTMLElement): void {
        const buttons = root.querySelectorAll<HTMLButtonElement>(".switch button");
        const input = root.querySelector<HTMLInputElement>("#loginInput");
        const goRegister = root.querySelector<HTMLSpanElement>("#goRegister");

        buttons.forEach(btn => {
            btn.onclick = () => {
                buttons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                this.mode = btn.dataset.mode as LoginMode;

                if (input) {
                    input.placeholder =
                        this.mode === "email" ? "Email" : "Phone";
                }
            };
        });

        if (goRegister) {
            goRegister.onclick = () => this.navigate("/register");
        }
    }
}