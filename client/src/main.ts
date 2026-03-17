import { Router } from "./router/Router";
import { LoginPage } from "./components/login";
import { RegisterPage } from "./components/register";
import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";
import { CartPage } from "./components/cart";
import './main.css';

const API_BASE = "http://localhost:5000";

interface Beer {
    id: number;
    name: string;
    price: number;
    category: string;
}

interface User {
    id: string;
    email: string;
    name: string;
}

// Резервные данные каталога, если бэкенд недоступен
const BEER_DATA_FALLBACK: Beer[] = [
    { id: 1, name: "Lager 1", price: 450, category: "Cat 1" },
    { id: 2, name: "Wheat 1", price: 520, category: "Cat 2" },
    { id: 3, name: "Fest 1", price: 600, category: "Cat 3" },
    { id: 4, name: "Dark 1", price: 480, category: "Cat 4" },
    { id: 5, name: "Ale 1", price: 550, category: "Cat 5" },
    { id: 6, name: "Zero 1", price: 390, category: "Cat 1" },
];

const root = document.getElementById("app");
if (!root) throw new Error("Root element not found");

const router = new Router();

const header = new Header(0, 0);
const footer = new Footer();

// Функция для получения текущего пользователя
function getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
    return null;
}

// Функция для проверки авторизации
function isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
}

// Функция для выхода
function logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.navigate('/');
}

// --- ГЛАВНАЯ СТРАНИЦА ---
router.register("/", async () => {
    console.log("Главная страница загружена");

    const currentUser = getCurrentUser();
    const welcomeMessage = currentUser
        ? `👋 Добро пожаловать, ${currentUser.name}!`
        : "Добро пожаловать в Oktober Shop";

    // Загружаем каталог и корзину с бэкенда
    let beerData: Beer[] = BEER_DATA_FALLBACK;
    let cartCount = 0;
    let cartTotal = 0;

    try {
        const [productsRes, cartRes] = await Promise.all([
            fetch(`${API_BASE}/products`),
            fetch(`${API_BASE}/cart`),
        ]);
        if (productsRes.ok) {
            const products = await productsRes.json();
            if (Array.isArray(products) && products.length > 0) beerData = products;
        }
        if (cartRes.ok) {
            const cart = await cartRes.json();
            const items = cart.items || [];
            cartCount = items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0);
            cartTotal = items.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);
        }
    } catch (_e) {
        // используем fallback и нулевую корзину
    }

    header.update(cartCount, cartTotal);

    root.innerHTML = `
        <div class="okt-page">
            <div id="header-container"></div>
            <main class="okt-content">
                <header class="okt-hero">
                    <h1 class="hero-title">🍺 OKTOBER SHOP</h1>
                    <p class="hero-subtitle">${welcomeMessage}</p>
                </header>
                <div class="okt-layout">
                    <aside class="okt-filters">
                        <div class="filter-card">
                            <label class="filter-label">Поиск</label>
                            <div class="search-box"><input type="text" id="mainSearch" placeholder="🔍 Поиск пива..." /></div>
                            <label class="filter-label">Категории</label>
                            <div class="filter-options">
                                ${[1, 2, 3, 4, 5].map(id => `
                                    <label class="checkbox-container">
                                        <input type="checkbox" class="cat-cb" data-id="${id}" />
                                        <span class="checkmark"></span>
                                        <span class="category-text">Категория ${id}</span>
                                    </label>
                                `).join("")}
                            </div>
                            <button class="btn-reset" id="clearFilters">Сбросить фильтры</button>
                        </div>
                    </aside>
                    <section class="okt-grid" id="beer-grid">
                        ${beerData.map(beer => `
                            <div class="beer-card">
                                <div class="beer-image">🍺</div>
                                <h3 class="beer-name">${beer.name}</h3>
                                <p class="beer-category">${beer.category}</p>
                                <p class="beer-price">${beer.price} ₽</p>
                                <button class="btn-buy" data-id="${beer.id}">➕ В КОРЗИНУ</button>
                            </div>
                        `).join("")}
                    </section>
                </div>
            </main>
            <div id="footer-container"></div>
        </div>
    `;

    header.mount(root.querySelector("#header-container")!);
    footer.mount(root.querySelector("#footer-container")!);

    setTimeout(() => {
        router.bindHeaderButtons();
    }, 50);

    // Добавление в корзину через API бэкенда
    root.querySelectorAll(".btn-buy").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = Number((e.currentTarget as HTMLElement).dataset.id);
            const beer = beerData.find(b => b.id === id);
            if (!beer) return;
            try {
                const res = await fetch(`${API_BASE}/cart`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productId: String(beer.id),
                        name: beer.name,
                        price: beer.price,
                        quantity: 1,
                    }),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    alert("Не удалось добавить в корзину: " + (err.message || res.status));
                    return;
                }
                const cart = await res.json();
                const items = cart.items || [];
                const count = items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0);
                const total = items.reduce((sum: number, i: { price: number; quantity: number }) => sum + i.price * i.quantity, 0);
                header.update(count, total);
                alert(`🍺 ${beer.name} добавлен в корзину!`);
            } catch (_e) {
                alert("Ошибка сети. Проверьте, что бэкенд запущен на http://localhost:5000");
            }
        });
    });

    // Сброс фильтров
    root.querySelector("#clearFilters")?.addEventListener("click", () => {
        root.querySelectorAll<HTMLInputElement>(".cat-cb").forEach(cb => (cb.checked = false));
    });

    // Поиск
    root.querySelector("#mainSearch")?.addEventListener("input", (e) => {
        const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
        const cards = root.querySelectorAll<HTMLElement>(".beer-card");
        cards.forEach((card, index) => {
            const beer = beerData[index];
            if (beer) {
                const matches = beer.name.toLowerCase().includes(searchTerm);
                card.style.display = matches ? "block" : "none";
            }
        });
    });
});

// --- СТРАНИЦЫ АВТОРИЗАЦИИ ---
router.register("/login", () => {
    // Если уже авторизован, редирект на главную
    if (isAuthenticated()) {
        router.navigate('/');
        return;
    }
    
    console.log("Страница логина загружена");
    root.innerHTML = '';
    const loginPage = new LoginPage((path: string) => router.navigate(path));
    loginPage.mount(root);
});

router.register("/register", () => {
    // Если уже авторизован, редирект на главную
    if (isAuthenticated()) {
        router.navigate('/');
        return;
    }
    
    console.log("Страница регистрации загружена");
    root.innerHTML = '';
    const registerPage = new RegisterPage((path: string) => router.navigate(path));
    registerPage.mount(root);
});

// --- СТРАНИЦА КОРЗИНЫ ---
router.register("/cart", () => {
    console.log("Страница корзины загружена");
    root.innerHTML = '';
    const cartPage = new CartPage();
    cartPage.mount(root);
});

// --- ПРЯМАЯ ПРИВЯЗКА КНОПОК ПОСЛЕ ЗАГРУЗКИ ---
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        router.bindHeaderButtons();
    }, 100);
});

router.resolve();