import "./style.css";

type LoginMode = "email" | "phone";

export class LoginPage {
    private mode: LoginMode = "email";

    mount(root: HTMLElement): void {
        root.innerHTML = `
        <div class="okt-login-bg">
            <div class="okt-login-card">

                <h1>🍺 Oktober Shop</h1>
                <p class="subtitle">Beer delivery for Oktoberfest</p>

                <div class="switch">
                    <button data-mode="phone">Phone</button>
                    <button data-mode="email" class="active">Email</button>
                </div>

                <input id="loginInput" placeholder="Email" />
                <input type="password" placeholder="Password"/>

                <button class="primary">Login</button>

                <span class="forgot">Forgot password?</span>

            </div>
        </div>
        `;

        this.bind();
    }

    private bind(): void {
        const buttons = document.querySelectorAll<HTMLButtonElement>(".switch button");
        const input = document.getElementById("loginInput") as HTMLInputElement;

        buttons.forEach(btn => {
            btn.onclick = () => {
                buttons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                this.mode = btn.dataset.mode as LoginMode;

                input.placeholder = this.mode === "email"
                    ? "Email"
                    : "Phone";
            };
        });
    }
}
