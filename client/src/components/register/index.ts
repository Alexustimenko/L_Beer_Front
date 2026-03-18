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

        <form data-registration class="auth-form" id="registrationForm">
        <div class="switch">
            <button data-mode="phone">Phone</button>
            <button data-mode="email" class="active">Email</button>
        </div>

        <input id="registerInput" placeholder="Email" />
        <input id="login" placeholder="Login" />
        <input id="phone" placeholder="Phone" />
        <input id="fullName" placeholder="Full name" />
        <input id="password" type="password" placeholder="Password"/>
        <input id="confirmPassword" type="password" placeholder="Confirm password"/>

        <button class="primary" id="registerBtn">Register</button>

        <span class="link-switch" id="goLogin">
            Already have an account? Login
        </span>
        </form>

    </div>
</div>
`;

        this.bind(root);
    }

private bind(root: HTMLElement): void {

    const buttons = root.querySelectorAll<HTMLButtonElement>(".switch button");
    const input = root.querySelector<HTMLInputElement>("#registerInput");
    const goLogin = root.querySelector<HTMLSpanElement>("#goLogin");

    const fullName = root.querySelector<HTMLInputElement>("#fullName");
    const login = root.querySelector<HTMLInputElement>("#login");
    const phone = root.querySelector<HTMLInputElement>("#phone");
    const password = root.querySelector<HTMLInputElement>("#password");
    const confirmPassword = root.querySelector<HTMLInputElement>("#confirmPassword");

    const registerBtn = root.querySelector<HTMLButtonElement>("#registerBtn");

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

    if (registerBtn) {

        registerBtn.onclick = async () => {

            if (!input || !fullName || !login || !phone || !password || !confirmPassword) return;

            if (password.value !== confirmPassword.value) {
                alert("Passwords do not match");
                return;
            }

            const data = {
                email: input.value,
                name: fullName.value,
                login: login.value,
                phone: phone.value,
                password: password.value
            };

            try {

                const response = await fetch("http://localhost:5000/register", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",

                    body: JSON.stringify(data)

                });

                if (response.ok) {

                    const payload = await response.json().catch(() => ({}));
                    if (payload?.user) localStorage.setItem("user", JSON.stringify(payload.user));

                    alert("Registration successful");

                    this.navigate("/login");

                } else {

                    alert("Registration failed");

                }

            } catch {

                alert("Server error");

            }

        };
    }
}
}