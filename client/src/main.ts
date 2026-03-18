import { Router } from "./router/Router";
import { LoginPage } from "./components/login";
import { RegisterPage } from "./components/register";
import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";
import { CartPage } from "./components/cart";
import { DeliveryPage } from "./components/delivery";
import { AdminPage } from "./components/admin";
import './main.css';

const API_BASE = "http://localhost:5000";

interface Beer {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    available: boolean;
    image?: string;
}

interface User {
    id: string;
    email: string;
    name: string;
}

// Резервные данные каталога, если бэкенд недоступен
const BEER_DATA_FALLBACK: Beer[] = [
    { id: 1, name: "Lager 1", description: "Light lager beer with a clean finish.", price: 450, category: "Cat 1", available: true },
    { id: 2, name: "Wheat 1", description: "Wheat beer with soft фруктовые ноты.", price: 520, category: "Cat 2", available: true },
    { id: 3, name: "Fest 1", description: "Festbier for Oktoberfest — malty and smooth.", price: 600, category: "Cat 3", available: true },
    { id: 4, name: "Dark 1", description: "Dark beer with caramel and roasted notes.", price: 480, category: "Cat 4", available: false },
    { id: 5, name: "Ale 1", description: "Ale with bright aroma and balanced bitterness.", price: 550, category: "Cat 5", available: true },
    { id: 6, name: "Zero 1", description: "Non-alcoholic beer, crisp and refreshing.", price: 390, category: "Cat 1", available: true },
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
    return !!localStorage.getItem('user');
}

// Функция для выхода
function logout(): void {
    fetch(`${API_BASE}/logout`, { method: "POST", credentials: "include" })
        .catch(() => {})
        .finally(() => {
            localStorage.removeItem('user');
            router.navigate('/');
        });
}

async function syncUserFromSession(): Promise<User | null> {
    try {
        const res = await fetch(`${API_BASE}/me`, { credentials: "include" });
        if (!res.ok) {
            localStorage.removeItem("user");
            return null;
        }
        const data = await res.json();
        if (data?.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            return data.user as User;
        }
        localStorage.removeItem("user");
        return null;
    } catch {
        return getCurrentUser();
    }
}

// --- ГЛАВНАЯ СТРАНИЦА ---
router.register("/", async () => {
    console.log("Главная страница загружена");

    const user = await syncUserFromSession();

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
            fetch(`${API_BASE}/cart`, { credentials: "include" }),
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
                            <label class="filter-label">Сортировка</label>
                            <select id="sortPrice" class="sort-select">
                                <option value="">Без сортировки</option>
                                <option value="price_asc">Цена ↑</option>
                                <option value="price_desc">Цена ↓</option>
                            </select>
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
                            <label class="checkbox-container">
                                <input type="checkbox" id="availableOnly" />
                                <span class="checkmark"></span>
                                <span class="category-text">Только в наличии</span>
                            </label>
                            <button class="btn-reset" id="clearFilters">Сбросить фильтры</button>
                        </div>
                    </aside>
                    <section class="okt-grid" id="beer-grid">
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

    const gridEl = root.querySelector("#beer-grid") as HTMLElement;

    const renderGrid = (data: Beer[]) => {
        gridEl.innerHTML = data.map(beer => `
            <div class="beer-card">
                <div class="beer-image">
                    ${beer.image
                        ? `<img src="${API_BASE}${beer.image}" alt="${beer.name}" class="beer-img" onerror="this.outerHTML='🍺'" />`
                        : "🍺"}
                </div>
                <h3 class="beer-name" data-title>${beer.name}</h3>
                <p class="beer-category">${beer.category}</p>
                <p class="beer-desc">${beer.description ?? ""}</p>
                <p class="beer-price" data-price>${beer.price} ₽</p>
                <div class="buy-row">
                    <input class="qty-input" type="number" min="1" value="1" data-qty="${beer.id}" />
                    <button class="btn-buy" data-id="${beer.id}" ${beer.available ? "" : "disabled"}>
                        ${beer.available ? "➕ В КОРЗИНУ" : "Нет в наличии"}
                    </button>
                </div>
            </div>
        `).join("");
    };

    const bindBuyButtons = (data: Beer[]) => {
        gridEl.querySelectorAll(".btn-buy").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                if (!user) {
                    alert("Корзина доступна только для зарегистрированных пользователей");
                    router.navigate("/login");
                    return;
                }
                const id = Number((e.currentTarget as HTMLElement).dataset.id);
                const beer = data.find(b => b.id === id);
                if (!beer) return;
                const qtyInput = gridEl.querySelector<HTMLInputElement>(`.qty-input[data-qty="${beer.id}"]`);
                const quantity = Math.max(1, Number(qtyInput?.value || 1));
                try {
                    const res = await fetch(`${API_BASE}/cart`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            productId: String(beer.id),
                            name: beer.name,
                            price: beer.price,
                            quantity,
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
    };

    const loadProducts = async () => {
        const q = (root.querySelector("#mainSearch") as HTMLInputElement | null)?.value?.trim() ?? "";
        const sort = (root.querySelector("#sortPrice") as HTMLSelectElement | null)?.value ?? "";
        const availableOnly = (root.querySelector("#availableOnly") as HTMLInputElement | null)?.checked ?? false;
        const categories = Array.from(root.querySelectorAll<HTMLInputElement>(".cat-cb"))
            .filter(cb => cb.checked)
            .map(cb => `cat ${cb.dataset.id}`); // backend хранит "Cat N" => сравнение в lower-case

        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (sort) params.set("sort", sort);
        if (availableOnly) params.set("available", "true");
        if (categories.length) params.set("category", categories.join(","));

        try {
            const res = await fetch(`${API_BASE}/products?${params.toString()}`);
            if (!res.ok) throw new Error();
            const products = await res.json();
            if (Array.isArray(products)) {
                beerData = products;
                renderGrid(beerData);
                bindBuyButtons(beerData);
            }
        } catch {
            // fallback
            renderGrid(beerData);
            bindBuyButtons(beerData);
        }
    };

    renderGrid(beerData);
    bindBuyButtons(beerData);

    // Сброс фильтров
    root.querySelector("#clearFilters")?.addEventListener("click", () => {
        root.querySelectorAll<HTMLInputElement>(".cat-cb").forEach(cb => (cb.checked = false));
        const av = root.querySelector<HTMLInputElement>("#availableOnly");
        if (av) av.checked = false;
        const sort = root.querySelector<HTMLSelectElement>("#sortPrice");
        if (sort) sort.value = "";
        const search = root.querySelector<HTMLInputElement>("#mainSearch");
        if (search) search.value = "";
        loadProducts();
    });

    root.querySelector("#mainSearch")?.addEventListener("input", () => loadProducts());
    root.querySelector("#sortPrice")?.addEventListener("change", () => loadProducts());
    root.querySelector("#availableOnly")?.addEventListener("change", () => loadProducts());
    root.querySelectorAll<HTMLInputElement>(".cat-cb").forEach(cb => cb.addEventListener("change", () => loadProducts()));
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

router.register("/delivery", () => {
    console.log("Страница доставки загружена");
    root.innerHTML = '';
    const deliveryPage = new DeliveryPage();
    deliveryPage.mount(root);
});

router.register("/admin", () => {
    root.innerHTML = '';
    const adminPage = new AdminPage();
    adminPage.mount(root);
});

// --- ПРЯМАЯ ПРИВЯЗКА КНОПОК ПОСЛЕ ЗАГРУЗКИ ---
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        router.bindHeaderButtons();
    }, 100);
});

router.resolve();