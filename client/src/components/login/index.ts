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

                <input id="loginInput" type="text" placeholder="Email" />
                <input id="passwordInput" type="password" placeholder="Password"/>
                
                <div id="errorMessage" class="error-message" style="color: red; display: none; margin: 10px 0;"></div>

                <button class="primary" id="loginButton">Login</button>

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
        const passwordInput = root.querySelector<HTMLInputElement>("#passwordInput");
        const loginButton = root.querySelector<HTMLButtonElement>("#loginButton");
        const goRegister = root.querySelector<HTMLSpanElement>("#goRegister");
        const errorDiv = root.querySelector<HTMLDivElement>("#errorMessage");

        // Переключение между email/phone
        buttons.forEach(btn => {
            btn.onclick = () => {
                buttons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.mode = btn.dataset.mode as LoginMode;
                
                if (input) {
                    input.placeholder = this.mode === "email" ? "Email" : "Phone";
                    input.type = this.mode === "email" ? "email" : "tel";
                }
            };
        });

        // Обработка входа
        if (loginButton) {
            loginButton.onclick = async () => {
                const email = input?.value;
                const password = passwordInput?.value;

                // Валидация
                if (!email || !password) {
                    this.showError(errorDiv, "Please fill all fields");
                    return;
                }

                if (this.mode === "email" && !email.includes('@')) {
                    this.showError(errorDiv, "Please enter a valid email");
                    return;
                }

                if (this.mode === "phone" && email.length < 10) {
                    this.showError(errorDiv, "Please enter a valid phone number");
                    return;
                }

                // Показываем загрузку
                loginButton.textContent = "Loading...";
                loginButton.disabled = true;

                try {
                    // Вход в админку: admin@gmail.com / admin → редирект в админку
                    if (email.trim() === 'admin@gmail.com' && password === 'admin') {
                        const adminRes = await fetch('http://localhost:5000/admin/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ email: email.trim(), password })
                        });
                        if (adminRes.ok) {
                            window.location.href = '/admin';
                            return;
                        }
                    }

                    const response = await fetch('http://localhost:5000/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({ 
                            identifier: email, // email/phone/login
                            password 
                        })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        // Сохраняем данные пользователя
                        localStorage.setItem('user', JSON.stringify(data.user));
                        
                        // Перенаправляем на главную
                        window.location.href = '/';
                    } else {
                        this.showError(errorDiv, data.message || 'Login failed');
                    }
                } catch (error) {
                    this.showError(errorDiv, 'Network error. Please try again.');
                    console.error('Login error:', error);
                } finally {
                    // Убираем загрузку
                    loginButton.textContent = "Login";
                    loginButton.disabled = false;
                }
            };
        }

        // Переход на регистрацию
        if (goRegister) {
            goRegister.onclick = () => this.navigate("/register");
        }

        // Добавляем обработку Enter
        const handleEnter = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && loginButton) {
                loginButton.click();
            }
        };

        if (input) input.addEventListener('keypress', handleEnter);
        if (passwordInput) passwordInput.addEventListener('keypress', handleEnter);
    }

    private showError(element: HTMLElement | null, message: string): void {
        if (element) {
            element.style.display = 'block';
            element.textContent = message;
            setTimeout(() => {
                element.style.display = 'none';
            }, 3000);
        }
    }
}