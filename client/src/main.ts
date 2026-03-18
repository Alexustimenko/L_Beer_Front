import { Router } from "./router/Router";
import { LoginPage } from "./components/login";
import { RegisterPage } from "./components/register";
import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";
import { CartPage } from "./components/cart";
import { AdminPage } from "./components/admin";
import "./main.css";

const API_BASE = "http://localhost:5000";

interface Beer {
    id: number | string;
    name?: string;
    title?: string;
    price: number;
    category?: string;
    volume?: string;
    image?: string;
}

interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
}

const BEER_DATA_FALLBACK: Beer[] = [
    { id: 1, name: "Lager 1", price: 450, category: "Cat 1" },
    { id: 2, name: "Wheat 1", price: 520, category: "Cat 2" },
    { id: 3, name: "Fest 1", price: 600, category: "Cat 3" },
    { id: 4, name: "Dark 1", price: 480, category: "Cat 4" },
    { id: 5, name: "Ale 1", price: 550, category: "Cat 5" },
    { id: 6, name: "Zero 1", price: 390, category: "Cat 1" },
];

const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Root element not found");
const root: HTMLElement = rootElement;

const router = new Router();
const header = new Header(0, 0);
const footer = new Footer();

function getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }
    return null;
}

function isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
}

function isAdmin(): boolean {
    return localStorage.getItem("role") === "admin";
}

router.register("/", async () => {
    console.log("Главная страница загружена");

    const currentUser = getCurrentUser();
    const welcomeMessage = currentUser
        ? `👋 Добро пожаловать, ${currentUser.name}!`
        : "Добро пожаловать в Oktober Shop";

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
            if (Array.isArray(products) && products.length > 0) {
                beerData = products;
            }
        }

        if (cartRes.ok) {
            const cart = await cartRes.json();
            const items = cart.items || [];
            cartCount = items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0);
            cartTotal = items.reduce((sum: number, i: { price?: number; quantity: number }) => sum + (i.price || 0) * i.quantity, 0);
        }
    } catch (_e) {
    }

    header.update(cartCount, cartTotal);

    const categories = [...new Set(
        beerData
            .map(beer => beer.category)
            .filter(Boolean)
    )] as string[];

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
                            <div class="search-box">
                                <input type="text" id="mainSearch" placeholder="🔍 Поиск пива..." />
                            </div>

                            <label class="filter-label">Категории</label>
                            <div class="filter-options">
                                ${categories.map(category => `
                                    <label class="checkbox-container">
                                        <input type="checkbox" class="cat-cb" data-category="${category}" />
                                        <span class="checkmark"></span>
                                        <span class="category-text">${category}</span>
                                    </label>
                                `).join("")}
                            </div>

                            <button class="btn-reset" id="clearFilters">Сбросить фильтры</button>
                        </div>
                    </aside>

                    <section class="okt-grid" id="beer-grid">
                        ${beerData.map(beer => `
                            <div class="beer-card">
                                <div class="beer-image">
                                    ${beer.image
                                        ? `<img src="${beer.image}" alt="${beer.title || beer.name}" style="width:100%;height:180px;object-fit:cover;border-radius:12px;">`
                                        : "🍺"}
                                </div>
                                <h3 class="beer-name">${beer.title || beer.name || "Без названия"}</h3>
                                <p class="beer-category">${beer.category || beer.volume || ""}</p>
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

    root.querySelectorAll(".btn-buy").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = String((e.currentTarget as HTMLElement).dataset.id);
            const beer = beerData.find(b => String(b.id) === id);
            if (!beer) return;

            try {
                const res = await fetch(`${API_BASE}/cart`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        productId: String(beer.id),
                        name: beer.title || beer.name,
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
                const total = items.reduce((sum: number, i: { price?: number; quantity: number }) => sum + (i.price || 0) * i.quantity, 0);
                header.update(count, total);

                alert(`🍺 ${(beer.title || beer.name)} добавлен в корзину!`);
            } catch (_e) {
                alert("Ошибка сети. Проверьте, что бэкенд запущен на http://localhost:5000");
            }
        });
    });

    function applyFilters() {
        const searchInput = root.querySelector<HTMLInputElement>("#mainSearch");
        const searchTerm = searchInput?.value.toLowerCase() || "";

        const selectedCategories = Array.from(
            root.querySelectorAll<HTMLInputElement>(".cat-cb:checked")
        ).map(cb => cb.dataset.category || "");

        const cards = root.querySelectorAll<HTMLElement>(".beer-card");

        cards.forEach((card, index) => {
            const beer = beerData[index];
            const beerName = (beer?.title || beer?.name || "").toLowerCase();
            const beerCategory = beer?.category || "";

            const matchSearch = beerName.includes(searchTerm);
            const matchCategory =
                selectedCategories.length === 0 || selectedCategories.includes(beerCategory);

            card.style.display = matchSearch && matchCategory ? "block" : "none";
        });
    }

    root.querySelector("#clearFilters")?.addEventListener("click", () => {
        root.querySelectorAll<HTMLInputElement>(".cat-cb").forEach(cb => (cb.checked = false));
        const searchInput = root.querySelector<HTMLInputElement>("#mainSearch");
        if (searchInput) searchInput.value = "";
        applyFilters();
    });

    root.querySelector("#mainSearch")?.addEventListener("input", applyFilters);

    root.querySelectorAll(".cat-cb").forEach(cb => {
        cb.addEventListener("change", applyFilters);
    });
});

router.register("/login", () => {
    if (isAuthenticated()) {
        router.navigate("/");
        return;
    }

    console.log("Страница логина загружена");
    root.innerHTML = "";
    const loginPage = new LoginPage((path: string) => router.navigate(path));
    loginPage.mount(root);
});

router.register("/register", () => {
    if (isAuthenticated()) {
        router.navigate("/");
        return;
    }

    console.log("Страница регистрации загружена");
    root.innerHTML = "";
    const registerPage = new RegisterPage((path: string) => router.navigate(path));
    registerPage.mount(root);
});

router.register("/cart", () => {
    console.log("Страница корзины загружена");
    root.innerHTML = "";
    const cartPage = new CartPage();
    cartPage.mount(root);
});

router.register("/admin", () => {
    console.log("Страница админки загружена");

    if (!isAdmin()) {
        router.navigate("/");
        return;
    }

    root.innerHTML = "";
    AdminPage();
});

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        router.bindHeaderButtons();
    }, 100);
});

router.resolve();