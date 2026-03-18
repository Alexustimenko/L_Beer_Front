import "./Header.css";

export class Header {
    private cartCount: number;
    private totalPrice: number;

    constructor(cartCount: number = 0, totalPrice: number = 0) {
        this.cartCount = cartCount;
        this.totalPrice = totalPrice;
    }

    // Проверка авторизации
    private isAuthenticated(): boolean {
        return !!localStorage.getItem('user');
    }

    // Получение имени пользователя
    private getUserName(): string {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return user.name || 'Пользователь';
            } catch {
                return 'Пользователь';
            }
        }
        return 'Пользователь';
    }

    // Выход из аккаунта
    private logout(): void {
        fetch("http://localhost:5000/logout", { method: "POST", credentials: "include" })
            .catch(() => {})
            .finally(() => {
                localStorage.removeItem('user');
                window.location.href = '/';
            });
    }

    // Метод для обновления данных без полной перерисовки всего хедера
    public update(count: number, total: number): void {
        this.cartCount = count;
        this.totalPrice = total;
        
        const countEl = document.querySelector("#cart-count");
        const totalEl = document.querySelector("#cart-total");
        
        if (countEl) countEl.textContent = this.cartCount.toString();
        if (totalEl) totalEl.textContent = `${this.totalPrice} ₽`;
    }

    mount(root: HTMLElement): void {
        const isAuth = this.isAuthenticated();
        const userName = this.getUserName();

        root.innerHTML = `
        <nav class="okt-navbar">
            <div class="okt-nav-container">
                <div class="okt-logo">
                    <span class="beer-emoji">🍺</span>
                    <div class="logo-text">
                        <span class="logo-main">OKTOBER SHOP</span>
                        <span class="logo-sub">Online Market</span>
                    </div>
                </div>

                <div class="okt-nav-actions">
                    <div class="user-menu">
                        ${isAuth ? `
                            <div class="user-info">
                                <span class="user-greeting">👋 ${userName}</span>
                                <button class="btn-logout" id="btnLogout">Выйти</button>
                            </div>
                        ` : `
                            <button class="btn-secondary" id="btnRegister">Регистрация</button>
                            <button class="btn-secondary" id="btnLogin">Войти</button>
                        `}
                    </div>
                    <div class="nav-divider"></div>
                    <button class="btn-cart-modern" id="btnCart">
                        <div class="cart-info">
                            <span class="cart-label">Корзина</span>
                            <span id="cart-total" class="cart-total">${this.totalPrice} ₽</span>
                        </div>
                        <div class="cart-badge-container">
                            <span class="cart-icon">🛒</span>
                            <span id="cart-count" class="cart-count">${this.cartCount}</span>
                        </div>
                    </button>
                </div>
            </div>
        </nav>
        `;

        // Добавляем обработчики событий
        setTimeout(() => {
            if (isAuth) {
                const logoutBtn = document.getElementById('btnLogout');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => this.logout());
                }
            } else {
                const loginBtn = document.getElementById('btnLogin');
                const registerBtn = document.getElementById('btnRegister');
                
                if (loginBtn) {
                    loginBtn.addEventListener('click', () => {
                        window.location.href = '/login';
                    });
                }
                
                if (registerBtn) {
                    registerBtn.addEventListener('click', () => {
                        window.location.href = '/register';
                    });
                }
            }

            const cartBtn = document.getElementById('btnCart');
            if (cartBtn) {
                cartBtn.addEventListener('click', () => {
                    window.location.href = '/cart';
                });
            }
        }, 0);
    }
}