import "./style.css";

type RegisterMode = "email" | "phone";

export class RegisterPage {
    private navigate: (path: string) => void;
    private mode: RegisterMode = "email";

    constructor(navigate: (path: string) => void) {
        this.navigate = navigate;
    }

    mount(root: HTMLElement): void {
        root.innerHTML = `
        <div class="auth-bg">
            <div class="auth-card">

                <h1>🍺 Oktober Shop</h1>
                <p class="subtitle">Create your account</p>

                <div class="switch">
                    <button data-mode="phone">Phone</button>
                    <button data-mode="email" class="active">Email</button>
                </div>

                <input id="registerInput" placeholder="Email" />
                <input placeholder="Full name" />
                <input type="password" placeholder="Password"/>
                <input type="password" placeholder="Confirm password"/>

                <button class="primary">Register</button>

                <span class="link-switch" id="goLogin">
                    Already have an account? Login
                </span>

            </div>
        </div>
        `;

        this.bind(root);
    }

    private bind(root: HTMLElement): void {
        const buttons = root.querySelectorAll<HTMLButtonElement>(".switch button");
        const input = root.querySelector<HTMLInputElement>("#registerInput");
        const goLogin = root.querySelector<HTMLSpanElement>("#goLogin");

        buttons.forEach(btn => {
            btn.onclick = () => {
                buttons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                this.mode = btn.dataset.mode as RegisterMode;

                if (input) {
                    input.placeholder =
                        this.mode === "email" ? "Email" : "Phone";
                }
            };
        });

        if (goLogin) {
            goLogin.onclick = () => this.navigate("/login");
        }
    }
}