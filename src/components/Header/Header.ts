import "./Header.css";

export class Header {
    private cartCount: number;
    private totalPrice: number;

    constructor(cartCount: number = 0, totalPrice: number = 0) {
        this.cartCount = cartCount;
        this.totalPrice = totalPrice;
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
                        <button class="btn-secondary" id="btnRegister">Регистрация</button>
                        <button class="btn-secondary" id="btnLogin">Войти</button>
                    </div>
                    <div class="nav-divider"></div>
                    <button class="btn-cart-modern">
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
    }
}